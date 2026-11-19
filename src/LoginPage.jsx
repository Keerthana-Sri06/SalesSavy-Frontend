
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./assets/styles.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:9090/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.message ||
            "Invalid username or password."
        );
        return;
      }

      // Support either response format:
      // { "role": "ADMIN" }
      // { "user": { "role": "ADMIN" } }
      const role = (
        data.role ||
        data.user?.role ||
        ""
      ).toUpperCase();

      if (role === "CUSTOMER") {
        navigate("/customerhome", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admindashboard", { replace: true });
      } else {
        setError(
          "Login succeeded, but the user role was not returned correctly. Please check the backend login response."
        );
      }
    } catch (err) {
      setError(
        "Unable to connect to the server. Make sure the Spring Boot backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        <div className="form-container">
          <h1 className="form-title">Welcome Back</h1>

          <p>
            Sign in to your SalesSavvy account
          </p>

          {error && (
            <p
              className="error-message"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSignIn}
            className="form-content"
          >
            <div className="form-group">
              <label
                htmlFor="username"
                className="form-label"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                autoComplete="username"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="password"
                className="form-label"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="form-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="form-footer">
  <p>
    New to SalesSavvy?{" "}
    <Link to="/register" className="form-link">
      Create an account
    </Link>
  </p>

  <p>
    Are you an admin?{" "}
    <Link to="/admin" className="form-link">
      Admin Login
    </Link>
  </p>
</div>
        </div>
      </div>
    </div>
  );
}
