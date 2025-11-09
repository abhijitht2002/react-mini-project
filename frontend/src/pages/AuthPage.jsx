import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        console.log("Register:", { name, email, password });
        // handle registration logic here
        const res = await registerUser(name, email, password);
        console.log("Registration response:", res);

        alert("Registration successful! Please login.");
        setIsRegister(false);
      } else {
        console.log("Login:", { email, password });
        // handle login logic here
        const res = await loginUser(email, password);
        console.log("Login response:", res);

        // Navigate to Todo page upon successful login
        navigate("/todos");
      }
    } catch (error) {
      console.error("Error:", error);

      // Show alert to the user
      if (error.response?.data?.message) {
        alert(error.response.data.message); // backend message
      } else {
        alert("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-xl p-6 transition-all duration-300">
        <h1 className="text-2xl font-semibold text-center mb-1">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          {isRegister
            ? "Start organizing your tasks and goals 🚀"
            : "Login to continue managing your Todos ✨"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
          />

          <button
            type="submit"
            className="w-full bg-gray-700 py-2 rounded-xl hover:bg-gray-600 transition font-medium"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-gray-500 text-center text-sm mt-6">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-300 hover:underline focus:outline-none"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
