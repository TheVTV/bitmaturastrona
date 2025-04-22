import { useState } from "react";
import logo from "/logo.png"; // Import the logo

interface LoginFormProps {
  onLogin: (token: string) => void; // Pass the token to the parent component
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    console.log("Submitting login:", { id, password }); // Debug log

    try {
      const response = await fetch(
        "https://bitserwer-4884a3bf6321.herokuapp.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful, token:", data.token); // Debug log
      onLogin(data.token); // Pass the token to the parent component
    } catch (err: any) {
      console.error("Login error:", err.message); // Debug log
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" /> {/* Add the logo */}
      <h2>Zaloguj się</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            id="id"
            placeholder="Wpisz swój numer ID"
            required
            value={id}
            onChange={(e) => setId(e.target.value)} // Update the ID state
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            placeholder="Wpisz hasło"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update the password state
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
