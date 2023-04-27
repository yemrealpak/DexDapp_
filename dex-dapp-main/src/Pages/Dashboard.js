import React, { useState } from "react";
import "./index.css";
import TopHistory from "../Components/PredictionHistory/top25.js";
import YourSummary from "../Components/PredictionHistory/yourSummary.js";

function HistoryPage() {
  return (
    <div className="predictionMainWrapper">
      <div className="dashboardTitle">Your Summary</div>
      <div className="predictionTopWrapper">
        <YourSummary />
      </div>
      <div className="dashboardTitle">Top 25 Wallets</div>
      <div className="predictionTopWrapper">
        <TopHistory />
      </div>
    </div>
  );
}

export default HistoryPage;
