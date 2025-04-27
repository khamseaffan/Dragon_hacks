import "./Home.css";
import D3Graph from "./D3Graph.tsx"; 

export default function Home() {
  return (
    <div className="home">
      <div className="navbar">
      <button className="navbar--button">Link Bank Account</button>
      <button className="navbar--button">Account Settings</button>
      <button className="navbar--button">View Income Graph</button>
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


