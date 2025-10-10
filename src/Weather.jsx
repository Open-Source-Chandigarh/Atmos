import React, { useState, useEffect } from 'react';
import './CSS/Weather.css';

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('London');
  const [showForecast, setShowForecast] = useState(true);
  const [apiKeyStatus, setApiKeyStatus] = useState('checking');

  const API_KEY = import.meta.env.VITE_APP_WEATHER_API_KEY;
  const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
  const UNITS = 'metric';

  
  const getDemoWeatherData = () => ({
    name: "London",
    sys: { country: "GB" },
    main: {
      temp: 15,
      feels_like: 13,
      humidity: 72,
      pressure: 1013
    },
    weather: [{
      main: "Clouds",
      description: "scattered clouds",
      icon: "03d"
    }],
    wind: { speed: 3.5 },
    visibility: 10000
  });

  const getDemoForecastData = () => {
    const today = new Date();
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      
      const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Mist'];
      const icons = ['01d', '03d', '10d', '13d', '50d'];
      const descriptions = ['clear sky', 'scattered clouds', 'light rain', 'light snow', 'mist'];
      
      const conditionIndex = index % conditions.length;
      
      return {
        date: date,
        maxTemp: 15 + Math.floor(Math.random() * 10),
        minTemp: 8 + Math.floor(Math.random() * 5),
        condition: conditions[conditionIndex],
        description: descriptions[conditionIndex],
        icon: icons[conditionIndex]
      };
    });
  };

   
  const testApiKey = async () => {
    if (!API_KEY) {
      console.error('No API key found');
      return { valid: false, error: 'No API key configured' };
    }

    console.log('Testing API key:', API_KEY.substring(0, 8) + '...');
    
    try {
      const testUrl = `${CURRENT_URL}?q=London&appid=${API_KEY}&units=${UNITS}`;
      console.log('Test URL:', testUrl);
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', data);
      
      if (response.status === 401) {
        return { 
          valid: false, 
          error: 'API key not activated yet. New keys take up to 2 hours to activate.' 
        };
      } else if (response.status === 429) {
        return { 
          valid: false, 
          error: 'API rate limit exceeded. Please try again later.' 
        };
      } else if (!response.ok) {
        return { 
          valid: false, 
          error: `API error: ${data.message || 'Unknown error'}` 
        };
      }
      
      return { valid: true, data };
    } catch (error) {
      console.error('API test error:', error);
      return { 
        valid: false, 
        error: `Network error: ${error.message}` 
      };
    }
  };

 
  const fetchCurrentWeather = async (cityName) => {
    const url = `${CURRENT_URL}?q=${cityName}&appid=${API_KEY}&units=${UNITS}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch weather for ${cityName}`);
    }
    
    const data = await response.json();
    setCurrentWeather(data);
  };

 
  const fetchForecast = async (cityName) => {
    const url = `${FORECAST_URL}?q=${cityName}&appid=${API_KEY}&units=${UNITS}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch forecast for ${cityName}`);
    }
    
    const data = await response.json();
    const dailyForecasts = processForecastData(data.list);
    setForecast(dailyForecasts);
  };
 
  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyData[date] || dailyData[date].length < 8) {
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
      }
    });

    return Object.keys(dailyData).slice(0, 5).map(date => {
      const dayData = dailyData[date];
      const temps = dayData.map(item => item.main.temp);
      const conditions = dayData.map(item => item.weather[0]);
      
      const weatherCounts = {};
      conditions.forEach(condition => {
        weatherCounts[condition.main] = (weatherCounts[condition.main] || 0) + 1;
      });
      const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) => 
        weatherCounts[a] > weatherCounts[b] ? a : b
      );
      
      const mainCondition = conditions.find(c => c.main === mostCommonWeather);

      return {
        date: new Date(date),
        avgTemp: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
        maxTemp: Math.round(Math.max(...temps)),
        minTemp: Math.round(Math.min(...temps)),
        condition: mostCommonWeather,
        description: mainCondition.description,
        icon: mainCondition.icon
      };
    });
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCityChange = (e) => {
    if (e.key === 'Enter') {
      const newCity = e.target.value.trim();
      if (newCity && apiKeyStatus === 'valid') {
        setCity(newCity);
        setLoading(true);
        setError(null);
        e.target.value = '';
      } else if (apiKeyStatus !== 'valid') {
        alert('API key not ready yet. Using demo data.');
      }
    }
  };

  
  useEffect(() => {
    const initializeWeather = async () => {
      setLoading(true);
      setError(null);
      
       
      const keyTest = await testApiKey();
      
      if (keyTest.valid) {
        console.log('✅ API key is valid');
        setApiKeyStatus('valid');
        
        try {
          await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city)
          ]);
          console.log('✅ Weather data loaded successfully');
        } catch (error) {
          console.error('❌ Failed to fetch weather data:', error);
          setError(error.message);
        }
      } else {
        console.warn('⚠️ API key not ready:', keyTest.error);
        setApiKeyStatus('invalid');
        
   
        setCurrentWeather(getDemoWeatherData());
        setForecast(getDemoForecastData());
        
        setError(`Using demo data: ${keyTest.error}`);
      }
      
      setLoading(false);
    };

    initializeWeather();
  }, [city, API_KEY]);

  if (loading) {
    return (
      <div className="weather-container">
        <div className="weather-loading">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
          <small>Testing API key and fetching data for {city}...</small>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-container">
    
      {apiKeyStatus === 'invalid' && (
        <div className="api-status-notice">
          <p>⚠️ <strong>Demo Mode Active</strong></p>
          <p>Your API key is not ready yet. New OpenWeatherMap keys take up to 2 hours to activate.</p>
          <p>Currently showing sample data. Your app will automatically switch to live data once the API key is active.</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Test API Key Again
          </button>
        </div>
      )}

      

    
      <div className="weather-search">
        <input
          type="text"
          placeholder={
            apiKeyStatus === 'valid' 
              ? "Enter city name and press Enter" 
              : "Demo mode - search disabled until API key activates"
          }
          onKeyPress={handleCityChange}
          className="city-input"
          disabled={apiKeyStatus !== 'valid'}
        />
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <div className="current-weather">
          <div className="weather-header">
            <h2>{currentWeather.name}, {currentWeather.sys.country}</h2>
            <p className="weather-date">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div className="weather-main">
            <div className="weather-icon">
              <img 
                src={getWeatherIcon(currentWeather.weather[0].icon)} 
                alt={currentWeather.weather[0].description}
              />
            </div>
            <div className="weather-info">
              <div className="temperature">
                {Math.round(currentWeather.main.temp)}°C
              </div>
              <div className="description">
                {currentWeather.weather[0].description}
              </div>
              <div className="feels-like">
                Feels like {Math.round(currentWeather.main.feels_like)}°C
              </div>
            </div>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{currentWeather.main.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{currentWeather.wind.speed} m/s</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pressure</span>
              <span className="detail-value">{currentWeather.main.pressure} hPa</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Visibility</span>
              <span className="detail-value">{(currentWeather.visibility / 1000).toFixed(1)} km</span>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast Toggle */}
      <div className="forecast-toggle">
        <button 
          className={`toggle-btn ${showForecast ? 'active' : ''}`}
          onClick={() => setShowForecast(!showForecast)}
        >
          {showForecast ? 'Hide' : 'Show'} 5-Day Forecast
        </button>
      </div>

      {/* 5-Day Forecast */}
      {showForecast && forecast.length > 0 && (
        <div className="forecast-container">
          <h3 className="forecast-title">5-Day Weather Forecast</h3>
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <div className="forecast-date">
                  {formatDate(day.date)}
                </div>
                <div className="forecast-icon">
                  <img 
                    src={getWeatherIcon(day.icon)} 
                    alt={day.description}
                  />
                </div>
                <div className="forecast-temps">
                  <span className="temp-high">{day.maxTemp}°</span>
                  <span className="temp-low">{day.minTemp}°</span>
                </div>
                <div className="forecast-condition">
                  {day.condition}
                </div>
                <div className="forecast-description">
                  {day.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;