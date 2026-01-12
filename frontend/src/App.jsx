import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./views/DashView";
import AdminDashboard from "./views/AdminDashView";
import ResetPasswordView from "./views/ResetPasswordView";
import PricingView from "./views/PricingView";
import LandingView from "./views/LandingView";

import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

import "./styles/App.css";
import logo from "./assets/logo_favicon.png";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // NEW: role stored in state (not frozen from localStorage)
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    const checkToken = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = "/";
  };

  // NEW: dynamic dashboard selection
  const dashView = role === "admin" ? <AdminDashboard /> : <Dashboard />;

  return (
    <Router>
      <div className="app-container">
        {/* Navigation bar */}
        <nav className="navbar">
          <div className="nav-left">
            <img src={logo} alt="Do&BEFitness logo" className="logo" />
          </div>

          <div className="nav-right">
            <Link to="/" className="nav-link">
              Početna
            </Link>

            <Link to="/pricing" className="nav-link">
              Cjenik
            </Link>

            {!isLoggedIn ? (
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                LogIn
              </button>
            ) : (
              <button className="login-btn" onClick={handleLogout}>
                LogOut
              </button>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route path="/pricing" element={<PricingView />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute>{dashView}</ProtectedRoute>}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPasswordView />}
          />
        </Routes>

        {/* Modals */}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
            onForgot={() => {
              setShowLogin(false);
              setShowForgot(true);
            }}
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              setRole(localStorage.getItem("role")); // NEW
            }}
          />
        )}

        {showRegister && (
          <RegisterModal onClose={() => setShowRegister(false)} />
        )}

        {showForgot && (
          <ForgotPasswordModal onClose={() => setShowForgot(false)} />
        )}
      </div>
    </Router>
  );
}

export default App;
