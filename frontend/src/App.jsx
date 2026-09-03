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

export default function App() {
  return (
    <BrowserRouter>
      {/* Gestion notif*/}
      <Toaster position="top-right" toastOptions={{duration: 3000,}}/>

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/Cgu" element={<Cgu />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/job-offers" element={<JobOffer />} />
        <Route path="/my-job-offers" element={<MyJobOffers />} />
        <Route path="/my-application" element={<Application />} />
        <Route path="/map" element={<MapPage />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
