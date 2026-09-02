import { useForm } from "react-hook-form";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../CSS/Login.css";
import NavBar from "../components/Navbar";
import { seekerpath } from '../utils/config.js';

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const isSeeker = role === "seeker";
  const isRH = role === "rh";

const onSubmit = async (formData) => {
  try {
    if (isSeeker) {
      const skills = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      const seekerResponse = await fetch(seekerpath,
        {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            skills,
            experience: formData.experience,
            availability: formData.availability,
          }),
        }
      );
      if (!seekerResponse.ok) {
        throw new Error("Erreur lors de la création du compte Seeker");
      }
      const seeker = await seekerResponse.json();
      console.log("Compte créé :", seeker);
    }

    if (isRH) {
      const rhResponse = await fetch("http://localhost:4242/rhs",
        {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify({
            userId: user.id,
            company: formData.company,
            position: formData.position,
          }),
        }
      );
      if (!rhResponse.ok) {
        throw new Error("Erreur lors de la création du profil RH");
      }
      const rh = await rhResponse.json();
      console.log("Compte créé :", user);
      console.log("Profil RH créé :", rh);
    }

    navigate("/login");
  } catch (error) {
    console.error(error);
  }
};

  // ROLE ERROR
  if (!isSeeker && !isRH) {
    return (
      <div className="page">
        <NavBar />
        <div className="form-card">
          <div className="form-header">
            <h1>Type de compte invalide</h1>
            <p>Veuillez choisir un type de compte.</p>
          </div>
          <Link to="/account" className="submit-btn">Retour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <NavBar />
      <div className="form-card">

        {/*HEADER*/}
        <div className="form-header">
          <h1>{isSeeker ? "Créer un compte Chercheur": "Créer un compte RH"}</h1>
          <p>Remplissez vos coordonnées pour commencer.</p>
        </div>

        {/*FORM*/}
        <form onSubmit={handleSubmit(onSubmit)} className="form">

          {/*FIRST NAME / LAST NAME*/}
          <div className="input-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                placeholder="Prénom"
                {...register("firstName", {required: "Le prénom est obligatoire",})}
              />
              {errors.firstName && (<span className="error">{errors.firstName.message}</span>)}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                placeholder="Nom"
                {...register("lastName", {required: "Le nom est obligatoire",})}
              />
              {errors.lastName && (<span className="error">{errors.lastName.message}</span>)}
            </div>
          </div>

          {/*EMAIL*/}
          <div className="input-row">
            <div className="form-group">
              <label htmlFor="email">Adresse Email</label>
              <input
                id="email"
                type="email"
                placeholder="example@example.com"
                {...register("email", {required: "L'email est obligatoire",pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Email invalide"},})}
              />
              {errors.email && (<span className="error">{errors.email.message}</span>)}
            </div>
            
            {/*PASSWORD*/}
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>

              <input
                id="password"
                type="password"
                placeholder="Mot de passe"
                {...register("password", {
                  required: "Le mot de passe est obligatoire",
                  // minLength: {value: 6, message: "Le mot de passe doit contenir au moins 6 caractères",},
                  })}
              />
              {errors.password && (<span className="error">{errors.password.message}</span>)}
            </div>
          </div>

          <div className="input-row">
            {/*GENDER*/}
            <div className="form-group">
              <label htmlFor="gender">Civilité</label>

              <select
                id="gender" {...register("gender", {required: "Veuillez choisir votre Civilité",})}
              >
                <option value="" hidden>Choisissez votre civilité</option>

                <option value="female">Madame</option>
                <option value="male">Monsieur</option>
                <option value="other">Autre</option>
              </select>

              {errors.gender && (<span className="error">{errors.gender.message}</span>)}
            </div>
            {/*USERNAME*/}
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                placeholder="Nom d'utilisateur"
                {...register("username", {required:"Le nom d'utilisateur est obligatoire",})}
              />
              {errors.username && (<span className="error">{errors.username.message}</span>)}
            </div>
          </div>

          {/*SEEKER ONLY FIELDS*/}
          {isSeeker && (
            <>
              {/* SKILLS */}

              <div className="form-group">
                <label htmlFor="skills">Compétences</label>
                <input
                  id="skills"
                  type="text"
                  placeholder="Ex: React, JavaScript, Marketing..."
                  {...register("skills", {required:"Les compétences sont obligatoires",})}
                />
                {errors.skills && (<span className="error">{errors.skills.message}</span>)}
              </div>

              <div className="input-row">
                {/* EXPERIENCE */}
                <div className="form-group">
                  <label htmlFor="experience">Expérience</label>

                  <input
                    id="experience"
                    type="text"
                    placeholder="Ex: 2 ans"
                    {...register("experience", {required:"L'expérience est obligatoire"})}
                  />

                  {errors.experience && (
                    <span className="error">{errors.experience.message}</span>)}
                </div>

                {/* AVAILABILITY */}
                <div className="form-group">
                  <label htmlFor="availability">Disponibilité</label>

                  <input
                    id="availability"
                    type="text"
                    placeholder="Ex: Temps plein"
                    {...register("availability", {required:"La disponibilité est obligatoire",})}
                  />

                  {errors.availability && (
                    <span className="error">{errors.availability.message}</span>)}
                </div>
              </div>
            </>
          )}

          {/*RH ONLY FIELDS*/}

          {isRH && (
            <>
              <div className="input-row">
                {/* COMPANY */}
                <div className="form-group">
                  <label htmlFor="company">Entreprise</label>

                  <input
                    id="company"
                    type="text"
                    placeholder="Nom de votre entreprise"
                    {...register("company", {required:"Le nom de l'entreprise est obligatoire",})}
                  />
                  {errors.company && (
                    <span className="error">{errors.company.message}</span>)}
                </div>

                {/* POSITION */}
                <div className="form-group">
                  <label htmlFor="position">Poste</label>

                  <input
                    id="position"
                    type="text"
                    placeholder="Ex: Responsable RH"
                    {...register("position", {required:"Le poste est obligatoire",})}
                  />

                  {errors.position && (
                    <span className="error">{errors.position.message}</span>)}
                </div>
              </div>
            </>
          )}

          {/*SUBMIT*/}

          <button type="submit" className="submit-btn">
            <span>{isSeeker ? "Créer mon compte Seeker": "Créer mon compte RH"}</span>
            <span className="arrow">  →</span>
          </button>

        </form>
        {/*FOOTER */}

        <p className="form-footer">Déjà un compte ?{" "}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
