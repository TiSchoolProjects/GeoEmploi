import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Login.css";
import NavBar from "../components/Navbar";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:4242/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Erreur login :", result);
        throw new Error(result.message || "Identifiants invalides");
      }

      if (typeof result.access_token !== "string") {
        console.error("Réponse du serveur :", result);
        throw new Error("Aucun access_token reçu du serveur");
      }

      const token = result.access_token;
      localStorage.setItem("access_token", token);
      const user = jwtDecode(token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/home");
    } catch (error) {
      console.error("Login Failed :", error);
    }
  };


  return (
    <div className="page">
      <NavBar />
      <div className="form-card">
        <div className="form-header">
          <h1>Bienvenue</h1>
          <p>Connectez-vous à votre compte.</p>
        </div>

        {authError && (
          <div className="server-error">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              placeholder="example@example.com"
              {...register("email", {required: "L'adresse email est requise",pattern: {value: /^\S+@\S+\.\S+$/,message: "Email invalide",}})}
            />
            {errors.email && (<span className="error">{errors.email.message}</span>)}
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              {...register("password", {required: "Le mot de passe est requis"})}
            />
            {errors.password && (<span className="error">{errors.password.message}</span>
            )}
          </div>
          <button type="submit" className="submit-btn">
            <span>Se connecter</span>
            <span className="arrow">→</span>
          </button>
        </form>
        <p className="form-footer">Pas encore de compte ?{" "}<Link to="/account">S'inscrire</Link></p>
      </div>
    </div>
  );
}
