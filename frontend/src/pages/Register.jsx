import { useForm } from "react-hook-form";
import logo from "../assets/jeb.png";
import "../CSS/Login.css";
import { Link } from "react-router-dom";
import NavBar from "../components/Navbar";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="page">
      <NavBar />
      <div className="form-card">
        <div className="form-header">
          
          <h1>Créer votre compte</h1>
          <p>Remplissez vos coordonnées pour commencer.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          
          <div className="input-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                placeholder="Prénom"
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              {errors.firstName && (
                <span className="error">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                placeholder="Nom"
                {...register("lastName", {
                  required: "Last name is required",
                })}
              />
              {errors.lastName && (
                <span className="error">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              placeholder="example@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Email invalide",
                },
              })}
            />
            {errors.email && (
              <span className="error">
                {errors.email.message}
              </span>
            )}
          </div>
/*
          <div className="form-group">
            <label htmlFor="gender">Genre</label>
            <select id="gender" {...register("gender")}>
              <option value="" hidden>
                Choisissez votre genre
              </option>
              <option value="female">Femme</option>
              <option value="male">Homme</option>
              <option value="other">Autre</option>
            </select>
          </div>
*/
          <button type="submit" className="submit-btn">
            <span>Confirmer votre profile</span>
            <span className="arrow">→</span>
          </button>
        </form>

        <p className="form-footer">
          Déjà un compte ?{" "}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
