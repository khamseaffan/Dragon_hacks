import "./Home.css";
import D3Graph from "./D3Graph.tsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const buttonHoverStyle = {
  backgroundColor: "#f0f0f0",
  cursor: "pointer",
};

export default function Home() {
  const [hovered, setHovered] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="navbar">
        <button
          className="navbar--button"
          style={hovered === 0 ? buttonHoverStyle : undefined}
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => {
            /* Link Bank Account logic here */
          }}
        >
          Link Bank Account
        </button>
        <button
          className="navbar--button"
          style={hovered === 1 ? buttonHoverStyle : undefined}
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/account-settings")}
        >
          Account Settings
        </button>
        <button
          className="navbar--button"
          style={hovered === 2 ? buttonHoverStyle : undefined}
          onMouseEnter={() => setHovered(2)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => {
            /* View Income Graph logic here */
          }}
        >
          View Income Graph
        </button>
      </div>
      <div className="content">
        <h1 className="header">Welcome to Your Income Tracker</h1>
        <p>Visualize and manage your monthly income with ease.</p>
        <div id="income-graph">
          <D3Graph />
        </div>
      </div>
    </div>
  );
}
