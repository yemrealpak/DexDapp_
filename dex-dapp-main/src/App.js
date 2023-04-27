import React from "react";
import "./App.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Referral from "./Pages/Referral";
import Dashboard from "./Pages/Dashboard";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./Pages/NotFound";
import BackgroundVideo from "../src/Assets/video.mp4";


function App() {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer />  

        <div className="videoWrapper">
          <video className="videoBg" autoPlay loop muted>
            <source src={BackgroundVideo} type="video/mp4" />
          </video>
        </div>

        <Header />
        <Routes>
          <Route path="/" element={<Referral />} />
          <Route path="*" element={<NotFound />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
