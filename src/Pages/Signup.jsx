import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { initCsrf } from "../utils/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initCsrf();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/signup", { email, password });
      navigate("/admin?message=Signup successful! Please login.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010616] flex items-center justify-center px-4 py-32">
      <div className="w-full max-w-md bg-[#050b24]/60 border border-gray-800 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
        <h2 className="text-3xl font-[heading] text-center text-white mb-2">Create Account</h2>
        <p className="text-gray-400 text-center font-[textFont] text-sm mb-8">
          Register a new administrative account
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6 font-[textFont]">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 font-[textFont] text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
              placeholder="admin@omesa.in"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-[textFont] text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-[textFont] text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-[textFont] font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-center font-[textFont] text-sm mt-8">
          Already have an account?{" "}
          <Link to="/admin" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
