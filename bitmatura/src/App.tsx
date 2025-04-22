import { useState } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import DownloadPage from "./components/DownloadPage";
import "./App.css";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  return (
    <BrowserRouter basename={import.meta.env.DEV ? "/" : "/bitmaturastrona/"}>
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginForm
                onLogin={(newToken: string) => {
                  setToken(newToken);
                  localStorage.setItem("token", newToken);
                }}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={token ? <DownloadPage /> : <Navigate to="/login" replace />}
        />
        {/* Redirect unmatched paths to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
