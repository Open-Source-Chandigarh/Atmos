import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./CSS/FeaturedNews.css";

const FeaturedNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const country = useSelector((state) => state.country);

  const API_KEY = import.meta.env.REACT_APP_NEWS_API_KEY;
  const categories = ["technology", "business", "sports", "health", "science", "entertainment"];

  const fetchNews = async () => {
    setLoading(true);
    try {
      const promises = categories.map(async (category) => {
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=1&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.articles?.[0] || null;
      });

      const results = await Promise.all(promises);
      setArticles(results.filter(article => article !== null));
    } catch (error) {
      console.error("Error fetching featured news:", error);
      setArticles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, [country]);

  const getCategoryIcon = (index) => {
    const icons = ["💻", "💼", "⚽", "❤️", "🔬", "🎬"];
    return icons[index] || "📰";
  };

  const getCategoryColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="featured-loading">
        <div className="spinner-large"></div>
        <p>Loading latest headlines...</p>
      </div>
    );
  }

  return (
    <div className="featured-news-grid">
      {articles.map((article, index) => (
        <a
          key={index}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="featured-card"
          style={{ background: getCategoryColor(index) }}
        >
          <div className="featured-card-header">
            <span className="featured-icon">{getCategoryIcon(index)}</span>
            <span className="featured-category">{categories[index]}</span>
          </div>
          
          <div className="featured-image-wrapper">
            <img
              src={article.urlToImage || "https://via.placeholder.com/400x250?text=No+Image"}
              alt={article.title}
              className="featured-image"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
              }}
            />
          </div>

          <div className="featured-content">
            <h4 className="featured-title">{article.title}</h4>
            <p className="featured-source">
              <span>📍</span> {article.source?.name}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default FeaturedNews;