import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import NewsBar from "./NewsBar";
import Weather from "./Weather";
import HomePage from "./HomePage";
import "./App.css";
import Footer from "./Footer";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/general" element={<NewsBar key="general" category="general" />} />
          <Route path="/business" element={<NewsBar key="business" category="business" />} />
          <Route path="/entertainment" element={<NewsBar key="entertainment" category="entertainment" />} />
          <Route path="/health" element={<NewsBar key="health" category="health" />} />
          <Route path="/science" element={<NewsBar key="science" category="science" />} />
          <Route path="/sports" element={<NewsBar key="sports" category="sports" />} />
          <Route path="/technology" element={<NewsBar key="technology" category="technology" />} />
          <Route path="/weather" element={<WeatherPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

// Full-page weather component
const WeatherPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 50%, #1e1e2e 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Weather />
      </div>
    </div>
  );
};

export default App;