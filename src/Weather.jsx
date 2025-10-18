import React, { useState, useEffect } from 'react';
import './CSS/Weather.css';

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('London');
  const [showForecast, setShowForecast] = useState(true);

  const API_KEY = import.meta.env.VITE_APP_WEATHER_API_KEY;
  const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
  const UNITS = 'metric';

  // Fetch current weather 
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

  // Fetch 5-day forecast
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

  // Process forecast data
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
      if (newCity) {
        setCity(newCity);
        setLoading(true);
        setError(null);
        e.target.value = '';
      }
    }
  };

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      if (!API_KEY) {
        setError('Weather API key not found. Please check your .env file.');
        setLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchCurrentWeather(city),
          fetchForecast(city)
        ]);
      } catch (err) {
        setError(err.message || 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city, API_KEY]);

  if (loading) {
    return (
      <div className="weather-container">
        <div className="weather-loading">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-container">
        <div className="weather-error">
          <h3>Weather Unavailable</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-container">
      {/* Search Bar */}
      <div className="weather-search">
        <input
          type="text"
          placeholder="Enter city name and press Enter"
          onKeyPress={handleCityChange}
          className="city-input"
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