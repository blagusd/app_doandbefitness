import { useState } from "react";
import "./LoginModal.css"; // same style

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Send Reset Link
          </button>
        </form>
        {message && <p>{message}</p>}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
