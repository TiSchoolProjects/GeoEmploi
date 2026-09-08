import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../CSS/Form.css";
import NavBar from "../components/Navbar";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
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
        throw new Error(result.message || t("login.invalidCredentials"));
      }

      if (typeof result.access_token !== "string") {
        console.error("Réponse du serveur :", result);
        throw new Error(t("login.noToken"));
      }

      const token = result.access_token;
      localStorage.setItem("access_token", token);
      const user = jwtDecode(token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(t("login.loginSuccess"));
      navigate("/home");
    } catch (error) {
      toast.error(t("login.loginError"));
      console.error("Login Failed :", error);
    }
  };

  return (
    <div className="page">
      <NavBar />
      <div className="form-card">
        <div className="form-header">
          <h1>{t("login.welcomeTitle")}</h1>
          <p>{t("login.subtitle")}</p>
        </div>

        {authError && (
          <div className="server-error">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="email">{t("login.emailLabel")}</label>
            <input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              {...register("email", {
                required: t("login.emailRequired"),
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: t("login.emailInvalid"),
                },
              })}
            />
            {errors.email && (<span className="error">{errors.email.message}</span>)}
          </div>
          <div className="form-group">
            <label htmlFor="password">{t("login.passwordLabel")}</label>
            <input
              id="password"
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              {...register("password", { required: t("login.passwordRequired") })}
            />
            {errors.password && (<span className="error">{errors.password.message}</span>)}
          </div>
          <button type="submit" className="submit-btn">
            <span>{t("login.submitButton")}</span>
            <span className="arrow">→</span>
          </button>
        </form>
        <p className="form-footer">
          {t("login.noAccount")}{" "}
          <Link to="/account">{t("login.registerLink")}</Link>
        </p>
      </div>
    </div>
  );
}