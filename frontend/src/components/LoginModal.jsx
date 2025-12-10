import "./LoginModal.css";

function LoginModal({ onClose, onRegister }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Log In</h2>
        <form>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="btn-primary">
            Log In
          </button>
        </form>
        <div className="modal-links">
          <button className="link-btn" onClick={onRegister}>
            Register
          </button>
          <button className="link-btn">Forgot Password?</button>
        </div>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
