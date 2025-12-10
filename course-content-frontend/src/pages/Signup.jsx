import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/contentApi";
import { FaLock, FaEnvelope, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import logo from "../assets/lernLogo.png";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await register({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.email);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Email might be already in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100 font-sans">

      {/* 🟢 Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">LearnHub</span>
        </div>
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors">
          Log in
        </Link>
      </header>

      {/* 🔵 Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 transition-all relative overflow-hidden">

           {/* Decorative background blob */}
           <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <img src={logo} alt="LernHub Logo" className="h-20 mx-auto mb-4 drop-shadow-sm" />
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-slate-500 text-sm mt-2">Start your learning journey today</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm border border-red-100 dark:border-red-900/50 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>Already have an account?</p>
            <Link to="/" className="text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold hover:underline transition-all">
              Login here
            </Link>
          </div>
        </div>
      </main>

      {/* 🟤 Footer */}
      <footer className="w-full py-6 text-center">
        <div className="flex justify-center gap-6 mb-2 text-slate-400">
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><FaGithub size={20} /></a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><FaTwitter size={20} /></a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><FaLinkedin size={20} /></a>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} LearnHub Inc. All rights reserved. | Privacy Policy | Terms of Service
        </p>
      </footer>

    </div>
  );
}

export default Signup;