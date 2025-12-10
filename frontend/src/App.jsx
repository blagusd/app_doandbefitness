import { useState } from "react";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import "./styles/App.css";
import logo from "./assets/logo_favicon.png";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="app-container">
      {/* Navigation bar */}
      <nav className="navbar">
        <img src={logo} alt="Do&BEFitness logo" className="logo-centered" />
        <button className="login-btn" onClick={() => setShowLogin(true)}>
          Log In
        </button>
      </nav>

      {/* Main landing page */}
      <main className="landing">
        <h2>
          <i>Dobrodošli</i> - Do&BEFitness
        </h2>
        <p>
          Bok, ja sam Dorotea - IT stručnjak, ali i certificirana fitness
          trenerica. Ovdje ćete pronaći personalizirane planove treninga,
          praćenje napretka i motivaciju za postizanje vaših ciljeva.
        </p>
      </main>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}

export default App;
