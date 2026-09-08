import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Cgu from "./pages/Cgu";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import JobOffer from "./pages/JobOffer";
import MyJobOffers from "./pages/MyJobOffers";
import Application from "./pages/Application";
import { Map } from "maplibre-gl";
import Footer from "./components/Footer";
import AdminPanel from "./pages/AdminPanel"

function ProtectedRoute({ allowedRoles, children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <BrowserRouter>
      <div className="app">
        {/* Gestion notif*/}
        <Toaster position="top-center" toastOptions={{duration: 5000,}}/>
        <main className="main-content">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/Cgu" element={<Cgu />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/map" element={<MapPage />} />
            {/* Login */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["seeker", "employer", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* seeker */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["seeker", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-application"
              element={
                <ProtectedRoute allowedRoles={["seeker", "admin"]}>
                  <Application />
                </ProtectedRoute>
              }
            />
            {/* employer */}
            <Route
              path="/job-offers"
              element={
                <ProtectedRoute allowedRoles={["employer", "admin"]}>
                  <JobOffer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-job-offers"
              element={
                <ProtectedRoute allowedRoles={["employer", "admin"]}>
                  <MyJobOffers />
                </ProtectedRoute>
              }
            />
            {/* admin */}
            <Route
              path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
