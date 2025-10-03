import React from "react";
import "./CSS/NewsItem.css";

export default function NewsItem(props) {
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="news-item-card"
    >
      <div className="news-item-image-container">
        <img
          src={props.imgUrl || "https://via.placeholder.com/400x250?text=No+Image"}
          alt={props.title}
          className="news-item-image"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
          }}
        />
        <div className="news-item-overlay"></div>
        {props.publishedAt && (
          <div className="news-item-time-badge">
            {getTimeAgo(props.publishedAt)}
          </div>
        )}
      </div>

      <div className="news-item-content">
        {props.source && (
          <div className="news-item-source">
            <span className="source-icon">📰</span>
            <span className="source-name">{props.source}</span>
          </div>
        )}

        <h3 className="news-item-title">
          {props.title?.slice(0, 100) || "No title available"}
          {props.title?.length > 100 && "..."}
        </h3>

        <p className="news-item-description">
          {props.description?.slice(0, 150) || "No description available"}
          {props.description?.length > 150 && "..."}
        </p>

        {props.author && (
          <div className="news-item-author">
            <span className="author-icon">✍️</span>
            <span className="author-name">{props.author}</span>
          </div>
        )}

        <div className="news-item-footer">
          <span className="read-more-text">Read Full Story</span>
          <span className="read-more-arrow">→</span>
        </div>
      </div>
    </a>
  );
}