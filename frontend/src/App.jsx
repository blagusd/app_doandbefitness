import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./views/DashView";
import ResetPasswordView from "./views/ResetPasswordView";
import PricingView from "./views/PricingView";

import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

import "./styles/App.css";
import logo from "./assets/logo_favicon.png";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showForgot, setShowForgot] = useState(false);

  // Listen for storage changes to update login state across tabs
  useEffect(() => {
    const checkToken = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navigation bar */}
        <nav className="navbar">
          <div className="nav-left">
            <img src={logo} alt="Do&BEFitness logo" className="logo" />
          </div>

          <div className="nav-right">
            <a href="/" className="nav-link">
              Početna
            </a>
            <a href="/pricing" className="nav-link">
              Cjenik
            </a>
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
          {/* Landing page */}
          <Route
            path="/"
            element={
              <main className="landing">
                <h2>
                  <i>Dobrodošli</i> - Do&BEFitness
                </h2>
                <p>
                  Bok, ja sam Dorotea - IT stručnjak, ali i certificirana
                  fitness trenerica. Ovdje ćete pronaći personalizirane planove
                  treninga, praćenje napretka i motivaciju za postizanje vaših
                  ciljeva.
                </p>
              </main>
            }
          />

          <Route path="/pricing" element={<PricingView />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordView />}
          />
        </Routes>

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
            onLoginSuccess={() => setIsLoggedIn(true)}
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
