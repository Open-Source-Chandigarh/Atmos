import React, { useState, useEffect } from "react";
import "./CSS/Weather.css";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("New York");
  const [inputCity, setInputCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = async (searchCity = city) => {
    setLoading(true);
    setError("");
    
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      
      if (!geoResponse.ok) {
        if (geoResponse.status === 429) {
          setError("API rate limit exceeded. Please try again later.");
        } else {
          setError(`Error ${geoResponse.status}: ${geoResponse.statusText}`);
        }
        setLoading(false);
        return;
      }
      
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        setError("City not found. Please check the spelling and try again.");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoData[0];
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 429) {
          setError("API rate limit exceeded. Please try again later.");
        } else {
          setError(`Error ${weatherResponse.status}: ${weatherResponse.statusText}`);
        }
        setLoading(false);
        return;
      }
      
      const weather = await weatherResponse.json();
      
      if (weather.cod && weather.cod !== 200) {
        setError(weather.message || "Failed to fetch weather data");
        setLoading(false);
        return;
      }
      
      setWeatherData(weather);
      setCity(searchCity);
      
      // Cache the successful result
      try {
        localStorage.setItem('lastWeatherData', JSON.stringify({
          data: weather,
          city: searchCity,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache weather data:', e);
      }
    } catch (err) {
      setError("Failed to fetch weather data. Please check your internet connection.");
      console.error("Weather error:", err);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Try to load cached weather data first
    try {
      const cached = localStorage.getItem('lastWeatherData');
      if (cached) {
        const { data, city: cachedCity, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Use cached data if it's less than 30 minutes old
        if (age < 30 * 60 * 1000) {
          setWeatherData(data);
          setCity(cachedCity);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached weather data:', e);
    }
    
    // Fetch fresh data if no valid cache exists
    fetchWeather();
  }, []);

  const handleSearch = () => {
    if (inputCity.trim()) {
      fetchWeather(inputCity.trim());
      setInputCity("");
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Snow: "❄️",
      Thunderstorm: "⛈️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };
    return icons[condition] || "🌤️";
  };

  if (loading && !weatherData) {
    return (
      <div className="weather-widget">
        <div className="weather-loading">
          <div className="spinner"></div>
          <p>Loading weather...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      {error && <div className="weather-error">{error}</div>}
      
      {weatherData && (
        <>
          <div className="weather-header">
            <div className="weather-icon-large">
              {getWeatherIcon(weatherData.weather[0]?.main)}
            </div>
            <div className="weather-temp">
              <span className="temp-value">{Math.round(weatherData.main.temp)}</span>
              <span className="temp-unit">°C</span>
            </div>
          </div>

          <div className="weather-info">
            <h3 className="weather-city">{weatherData.name}</h3>
            <p className="weather-description">
              {weatherData.weather[0]?.description}
            </p>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <span className="detail-icon">💧</span>
              <div>
                <p className="detail-label">Humidity</p>
                <p className="detail-value">{weatherData.main.humidity}%</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🌡️</span>
              <div>
                <p className="detail-label">Feels Like</p>
                <p className="detail-value">{Math.round(weatherData.main.feels_like)}°C</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">💨</span>
              <div>
                <p className="detail-label">Wind Speed</p>
                <p className="detail-value">{weatherData.wind.speed} m/s</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🔽</span>
              <div>
                <p className="detail-label">Pressure</p>
                <p className="detail-value">{weatherData.main.pressure} hPa</p>
              </div>
            </div>
          </div>

          <div className="weather-search">
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search city..."
              className="weather-input"
            />
            <button onClick={handleSearch} className="weather-search-btn">
              🔍
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;