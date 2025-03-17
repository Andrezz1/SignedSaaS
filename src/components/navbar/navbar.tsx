import { useState } from "react";
import "./navbar.css";

interface NavBarProps {
  brandName: string;
  imageSrcPath: string;
  navItems: string[];
}

function NavBar({ brandName, imageSrcPath, navItems }: NavBarProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a className="navbar-brand" href="#">
          <img src={imageSrcPath} className="navbar-logo" alt="Logo" />
          <span className="navbar-title">{brandName}</span>
        </a>
        <button className="navbar-toggler">☰</button>
        <div className="navbar-menu">
          <ul className="navbar-nav">
            {navItems.map((item, index) => (
              <li
                key={item}
                className={selectedIndex === index ? "nav-item active" : "nav-item"}
                onClick={() => setSelectedIndex(index)}
              >
                <a className="nav-link" href="#">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <form className="navbar-search">
            <input type="search" placeholder="Search" className="search-input" />
            <button type="submit" className="search-button">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
