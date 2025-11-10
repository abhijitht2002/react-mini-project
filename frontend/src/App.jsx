import React from "react";
import { Routes, Route } from "react-router-dom";
import Todos from "./pages/Todos";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./pages/PrivateRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route
          path="todos"
          element={
            <PrivateRoute>
              <Todos />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
