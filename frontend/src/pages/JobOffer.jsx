import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../CSS/Login.css";
import NavBar from "../components/Navbar";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/auth";
import { apiFetch } from "../api/client";

export default function JobOffer() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const token = getToken();

  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const onSubmit = async (data) => {
    try {
      const response = await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          adress: data.adress,
          employerId: user.sub,
        }),
      });

      if (!response) {
        throw new Error(result.message || "Informations invalides");
      }
      toast.success("Offre crée avec succès")
      navigate("/map");
    } catch (error) {
      toast.error("Impossible de crée l'offre")
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
            <textarea id="description" placeholder="Description du job" rows="6"
              {...register("description", {required: "La description est requise",})}
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
