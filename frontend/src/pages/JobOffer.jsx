import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Login.css";
import NavBar from "../components/Navbar";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function JobOffer() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:4242/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          adress: data.adress,
          employerId: user.sub,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Erreur  Post:", result);
        throw new Error(result.message || "Informations invalides");
      }

      navigate("/map");
    } catch (error) {
      console.error("Post Failed :", error);
    }
  };


  return (
    <div className="page">
      <NavBar />
      <div className="form-card">
        <div className="form-header">
          <h1>Création d'offre d'emploi</h1>
        </div>

        {authError && (
          <div className="server-error">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="text">Titre</label>
            <input
              id="title"
              type="text"
              placeholder="CDI - employée polyvalent"
              {...register("title", {required: "L'intitulé du job est requis"})}
            />
            {errors.email && (<span className="error">{errors.email.message}</span>)}
          </div>
          <div className="form-group">
            <label htmlFor="text">Description</label>
            <input
              id="description"
              type="text"
              placeholder="Description du job"
              {...register("description", {required: "La description est requise"})}
            />
            {errors.password && (<span className="error">{errors.password.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="text">Adresse</label>
            <input
              id="adress"
              type="text"
              placeholder="12 rue Jean-Louis Bertrand, 35000 Rennes"
              {...register("adress", {required: "L'Adresse est requise"})}
            />
            {errors.password && (<span className="error">{errors.password.message}</span>
            )}
          </div>
          <button type="submit" className="submit-btn">
            <span>Poster l'offre</span>
            <span className="arrow">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
