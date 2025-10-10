import React, { useState, useEffect } from "react";
import "./CSS/Weather.css";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("New York");
  const [inputCity, setInputCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const WEATHER_API_KEY =
    import.meta.env.REACT_APP_WEATHER_API_KEY ||
    "d1845658f92b31c64bd94f06f7188c9c";

  const fetchWeather = async (searchCity = city) => {
    setLoading(true);
    setError("");

    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchCity}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        setError("City not found. Please try again.");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoData[0];

      // 🌤 Current Weather
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);
      const weather = await weatherResponse.json();
      setWeatherData(weather);

      // 📅 5-Day Forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecast = await forecastResponse.json();

      // Filter one forecast per day (closest to 12 PM)
      const daily = {};
      forecast.list.forEach((item) => {
        if (item.dt_txt.includes("12:00:00")) {
          const day = new Date(item.dt_txt).toLocaleDateString("en-US", {
            weekday: "short",
          });
          if (!daily[day]) daily[day] = item;
        }
      });

      setForecastData(Object.values(daily));
      setCity(searchCity);
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error("Weather error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
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
              <span className="temp-value">
                {Math.round(weatherData.main.temp)}
              </span>
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
                <p className="detail-value">
                  {Math.round(weatherData.main.feels_like)}°C
                </p>
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

          <div className="weather-forecast">
            {forecastData.map((day, index) => (
              <div key={index} className="forecast-card">
                <p className="forecast-day">
                  {new Date(day.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </p>
                <p className="forecast-icon">
                  {getWeatherIcon(day.weather[0]?.main)}
                </p>
                <p className="forecast-temp">
                  {Math.round(day.main.temp_max)}° /{" "}
                  {Math.round(day.main.temp_min)}°
                </p>
                <p className="forecast-desc">
                  {day.weather[0]?.description}
                </p>
              </div>
            ))}
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
