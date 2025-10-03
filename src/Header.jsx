import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreator } from "./Store";
import "./CSS/Header.css";
import Logo from "./assets/Atmos_Logo-removebg-preview.png"
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const country = useSelector((state) => state.country);
  const dispatch = useDispatch();
  const { countryChange } = bindActionCreators(actionCreator, dispatch);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/general", label: "General", icon: "📰" },
    { path: "/business", label: "Business", icon: "💼" },
    { path: "/entertainment", label: "Entertainment", icon: "🎬" },
    { path: "/health", label: "Health", icon: "❤️" },
    { path: "/science", label: "Science", icon: "🔬" },
    { path: "/sports", label: "Sports", icon: "⚽" },
    { path: "/technology", label: "Technology", icon: "💻" },
    { path: "/weather", label: "Weather", icon: "🌤️" }
  ];

  const countries = [
    { code: "us", name: "USA", flag: "🇺🇸" },
    { code: "gb", name: "UK", flag: "UK" },
    { code: "in", name: "India", flag: "🇮🇳" },
    { code: "ca", name: "Canada", flag: "🇨🇦" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <Link className="nav-logo" to="/">
            <div className="logo-icon">
                <img src={Logo} alt="" width={110} height={110}/>
            </div>
            {/* <span className="logo-text">NewsHub</span> */}
          </Link>

          {/* Desktop Menu */}
          <div className="nav-links-desktop">
            {navItems.map((item) => (
              <Link
                key={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                to={item.path}
              >
                {/* <span className="nav-icon">{item.icon}</span> */}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Country Selector */}
          <div className="country-selector">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => countryChange(c.code)}
                className={`country-btn ${country === c.code ? "active" : ""}`}
                title={c.name}
              >
                {c.flag}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? "active" : ""}`}
                to={item.path}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="mobile-country-selector">
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    countryChange(c.code);
                    setMenuOpen(false);
                  }}
                  className={`country-btn ${country === c.code ? "active" : ""}`}
                >
                  {c.flag} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;