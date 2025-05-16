import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './loginpage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        timezone,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      toast.success('Login successful! Redirecting...');

      setTimeout(() => {
        window.location.href = '/users';
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="w-100 d-flex justify-content-center align-items-center login-bg">
      <div className="login-card shadow p-4 bg-white rounded">
        <h2 className="text-center text-dark mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
