import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api/contentApi";
import {
  FaLock, FaEnvelope, FaGithub, FaTwitter, FaLinkedin,
  FaMoon, FaSun
} from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/lernLogo.png";
import loginHero from "../assets/login-bg.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.email);

      if (res.data.profilePicture) {
        localStorage.setItem("userAvatar", res.data.profilePicture);
      } else {
        localStorage.removeItem("userAvatar");
      }
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await googleLogin(credentialResponse.credential);
      localStorage.setItem("token", res.data.token);
      const decoded = jwtDecode(res.data.token);
      localStorage.setItem("userEmail", decoded.sub);

      if (res.data.profilePicture) {
        localStorage.setItem("userAvatar", res.data.profilePicture);
      } else {
        localStorage.removeItem("userAvatar");
      }
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ h-screen ensures no scrolling
    <div className="h-screen flex font-sans overflow-hidden transition-colors duration-300 bg-white dark:bg-slate-950">

      {/* 🟢 LEFT SIDE: Illustration */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

        {/* Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-200/40 dark:bg-sky-600/20 blur-[120px] rounded-full pointer-events-none transition-colors duration-300"></div>

        {/* Illustration */}
        <img
            src={loginHero}
            alt="LearnHub Illustration"
            className="w-full max-w-2xl max-h-[85vh] object-contain relative z-10 drop-shadow-xl animate-in fade-in zoom-in duration-700 hover:scale-[1.02] transition-transform duration-500"
        />
      </div>


      {/* 🔵 RIGHT SIDE: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8 relative bg-white dark:bg-slate-950 transition-colors duration-300">

        {/* Theme Toggle - Top Left */}
        <div className="absolute top-6 left-6 z-20">
           <button
             onClick={toggleTheme}
             className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
             title="Toggle Theme"
           >
             {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
           </button>
        </div>

        {/* ✅ Main Content */}
        <div className="w-full max-w-sm space-y-5 z-10 flex flex-col justify-center">

          {/* Logo & Heading */}
          <div className="text-center">
            <div className="h-12 w-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                 <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Log in to continue your learning journey.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-lg text-xs text-center border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    </div>
                    <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    </div>
                    <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex justify-end mt-1">
                    <a href="#" className="text-xs font-medium text-sky-600 dark:text-sky-500 hover:underline">Forgot password?</a>
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white py-2.5 rounded-lg font-bold text-base shadow-md shadow-sky-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 mt-1"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-white dark:bg-slate-950 px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <div className="flex justify-center">
             <div className="w-full flex justify-center transform hover:scale-[1.01] transition-transform">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                  theme={darkMode ? "filled_black" : "outline"}
                  shape="pill"
                  size="medium"
                  text="signin_with"
                  width="350"
                />
             </div>
          </div>

          {/* ✅ Signup Link - Moved Here (Bottom of Form) */}
          <div className="text-center mt-6">
             <span className="text-sm text-slate-500 dark:text-slate-400">Don't have an account? </span>
             <Link to="/signup" className="text-sm text-sky-600 dark:text-sky-500 font-bold hover:underline transition-colors">Sign up</Link>
          </div>

        </div>


      </div>
    </div>
  );
}

export default Login;