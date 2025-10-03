import React from "react";
import HomepageNews from "./HomepageNews";
import Weather from "./Weather";
import FeaturedNews from "./FeaturedNews";
import "./CSS/HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Stay Informed with <span className="gradient-text">Real-Time News</span>
          </h1>
          <p className="hero-subtitle">
            Breaking news, trending stories, and weather updates from around the world
          </p>
        </div>
      </section>

      {/* Top Stories & Weather Grid */}
      <div className="content-wrapper">
        <div className="grid-container">
          {/* Featured News Section */}
          <div className="featured-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="title-icon">🔥</span>
                Top Stories
              </h2>
            </div>
            <HomepageNews />
          </div>

          {/* Weather Widget */}
          <div className="weather-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="title-icon">🌤️</span>
                Weather
              </h2>
            </div>
            <Weather />
          </div>
        </div>

        {/* Latest News Section */}
        <div className="latest-news-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">📰</span>
              Latest Headlines
            </h2>
          </div>
          <FeaturedNews />
        </div>
      </div>
    </div>
  );
};

export default HomePage;