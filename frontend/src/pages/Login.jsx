/**
 * Login.jsx
 * Authentication form. On success stores token and role then redirects based on role.
 */
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from '../components/ToastProvider'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  // Attempt login and set localStorage on success

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);

      // Redirect based on role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teller") navigate("/teller");
      else navigate("/client");
    } catch (err) {
      toast.add(err.response?.data?.message || "Login failed", 'error');
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="card w-96 relative z-10">
        <form onSubmit={handleLogin}>
          <h2 className="page-title text-center">Welcome To RIM Electronics</h2>
          <p className="muted text-center mb-4">Sign in to continue</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full input mb-4"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full input mb-4"
            required
          />
          <button
            type="submit"
            className="w-full btn-primary"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
