import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import NewsItem from "./NewsItem";
import "./CSS/NewsBar.css";

export default function NewsBar(props) {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const country = useSelector((state) => state.country);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-backend-url.com';
  const pageSize = 12;

  const fetchNews = async (pageNumber = page) => {
    setLoading(true);
    try {
      const url = `${BACKEND_URL}/api/news?country=${country}&category=${props.category}&pageSize=${pageSize}&page=${pageNumber}`;
      const response = await fetch(url);
      const data = await response.json();
      
      setArticles(data.articles || []);
      setTotalResults(data.totalResults || 0);
    } catch (error) {
      console.error("Error fetching news:", error);
      setArticles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    fetchNews(1);
  }, [props.category, country]);

  const handlePreviousClick = () => {
    const newPage = page - 1;
    setPage(newPage);
    fetchNews(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextClick = () => {
    const newPage = page + 1;
    setPage(newPage);
    fetchNews(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCategoryIcon = () => {
    const icons = {
      general: "📰",
      business: "💼",
      entertainment: "🎬",
      health: "❤️",
      science: "🔬",
      sports: "⚽",
      technology: "💻"
    };
    return icons[props.category] || "📰";
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <div className="newsbar-container">
      <div className="newsbar-header">
        <div className="newsbar-title-wrapper">
          <span className="newsbar-icon">{getCategoryIcon()}</span>
          <h1 className="newsbar-title">
            {props.category.charAt(0).toUpperCase() + props.category.slice(1)} News
          </h1>
        </div>
        <div className="newsbar-stats">
          <span className="stat-badge">
            {totalResults} articles
          </span>
          <span className="stat-badge">
            Page {page} of {totalPages}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="newsbar-loading">
          <div className="loading-spinner"></div>
          <p>Loading {props.category} news...</p>
        </div>
      ) : (
        <>
          <div className="newsbar-grid">
            {articles.map((article, index) => (
              <NewsItem
                key={index}
                title={article.title}
                description={article.description}
                url={article.url}
                imgUrl={article.urlToImage}
                author={article.author}
                publishedAt={article.publishedAt}
                source={article.source?.name}
              />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="no-articles">
              <span className="no-articles-icon">📭</span>
              <h3>No articles found</h3>
              <p>Try selecting a different country or check back later</p>
            </div>
          )}

          {articles.length > 0 && (
            <div className="newsbar-pagination">
              <button
                className="pagination-btn prev-btn"
                onClick={handlePreviousClick}
                disabled={page <= 1}
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              <div className="pagination-info">
                <span className="page-number">{page}</span>
                <span className="page-separator">/</span>
                <span className="page-total">{totalPages}</span>
              </div>

              <button
                className="pagination-btn next-btn"
                onClick={handleNextClick}
                disabled={page >= totalPages}
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}