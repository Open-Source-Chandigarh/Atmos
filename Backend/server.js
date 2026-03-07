import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with explicit configuration
app.use(cors({
  origin: '*', // Allow all origins (restrict in production)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;
const WEATHER_API_KEY = process.env.VITE_WEATHER_API_KEY;

// Log to verify keys are loaded (remove in production)
console.log('Environment Variables Loaded:');
console.log('NEWS_API_KEY:', NEWS_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('WEATHER_API_KEY:', WEATHER_API_KEY ? '✓ Loaded' : '✗ Missing');

// News API Proxy
app.get('/api/news', async (req, res) => {
  try {
    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const { country, category, pageSize = 12, page = 1 } = req.query;
    
    if (!country) {
      return res.status(400).json({ error: 'Country parameter required' });
    }

    let url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}&pageSize=${pageSize}&page=${page}`;
    
    if (category) {
      url += `&category=${category}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    res.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
});

// Weather API Proxy
app.get('/api/weather', async (req, res) => {
  try {
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const { lat, lon, city } = req.query;
    
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'City or lat/lon parameters required' });
    }

    let url;
    
    if (city) {
      // Geocode the city first
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      
      if (!geoResponse.ok) {
        return res.status(geoResponse.status).json({ error: 'Failed to geocode city' });
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      
      const { lat: latitude, lon: longitude } = geoData[0];
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather', details: error.message });
  }
});

// Forecast API Proxy
app.get('/api/forecast', async (req, res) => {
  try {
    if (!WEATHER_API_KEY) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const { lat, lon, city } = req.query;
    
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'City or lat/lon parameters required' });
    }

    let url;
    
    if (city) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      
      if (!geoResponse.ok) {
        return res.status(geoResponse.status).json({ error: 'Failed to geocode city' });
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      
      const { lat: latitude, lon: longitude } = geoData[0];
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', keys_loaded: { news: !!NEWS_API_KEY, weather: !!WEATHER_API_KEY } });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
