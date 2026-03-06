import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./CSS/HomepageNews.css";

const HomepageNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const country = useSelector((state) => state.country);
   
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-backend-url.com';

  const getNews = async () => {
    setLoading(true);
    try {
      const url = `${BACKEND_URL}/api/news?country=${country}&pageSize=3`;
      const response = await fetch(url);
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setArticles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getNews();
  }, [country]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading top stories...</p>
      </div>
    );
  }

  return (
    <div className="homepage-news-grid">
      {articles.map((article, index) => (
        <a
          key={index}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card"
        >
          <div className="news-image-container">
            <img
              src={article.urlToImage || "https://via.placeholder.com/600x400?text=No+Image"}
              alt={article.title}
              className="news-image"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
              }}
            />
            <div className="news-overlay"></div>
          </div>
          <div className="news-content">
            <div className="news-meta">
              <span className="news-source">{article.source?.name || "Unknown"}</span>
              <span className="news-date">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="news-title">{article.title}</h3>
            <p className="news-description">
              {article.description?.slice(0, 120) || "No description available"}...
            </p>
            <div className="read-more">
              <span>Read Full Article</span>
              <span className="arrow">→</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default HomepageNews;