import { useState } from "react";
import { useParams } from "react-router-dom";

function ResetPasswordView() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );
      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">
          Reset Password
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPasswordView;
