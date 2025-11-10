import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-6">Page not found or you are not authorized.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition"
      >
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound;