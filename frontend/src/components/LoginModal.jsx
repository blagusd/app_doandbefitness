import { useState } from "react";
import "./LoginModal.css";
import { useNavigate } from "react-router-dom";

function LoginModal({ onClose, onLoginSuccess, onRegister, onForgot }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // navigate hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();

      // save token in localStorage
      localStorage.setItem("token", result.token);
      if (result.user && result.user.role) {
        localStorage.setItem("role", result.user.role);
      }

      onClose();
      onLoginSuccess();
      // re-route to dashboard
      navigate("/dashboard");
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
        <div className="modal-links">
          <button className="link-btn" onClick={onRegister}>
            Register
          </button>
          <button className="link-btn" onClick={onForgot}>
            Password forgotten?
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
