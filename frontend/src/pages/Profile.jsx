import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Login.css";
import NavBar from "../components/Navbar";

export default function EditProfile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

    useEffect(() => {
    const getProfile = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const endpoint = user.role === "employer"
          ? `http://localhost:4242/employers/${user.sub}`
          : `http://localhost:4242/seekers/${user.sub}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message || "Impossible de récupérer le profil"
          );
        }

        reset({
          firstName: data.user?.firstname || "",
          lastName: data.user?.lastname || "",
          email: data.user?.email || "",

          skills: Array.isArray(data.skills)
            ? data.skills.join(", ")
            : data.skills || "",

          experience: data.experience || "",
          availability: data.availability || "",

          companyName: data.companyName || "",
          companyDesc: data.companyDesc || "",
        });
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    getProfile();
  }, [reset, navigate]);


  if (!user) {
    return null;
  }

  const isSeeker = user.role === "seeker";
  const isRH = user.role === "employer";

  const onSubmit = async (formData) => {
    try {
      const skills = formData.skills
        ? formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      if (isSeeker) {
        body.skills = skills;
        body.experience = formData.experience;
        body.availability = formData.availability;
      }

      if (isRH) {
        body.companyName = formData.companyName;
        body.companyDesc = formData.companyDesc;
      }
      const endpoint = isRH ? `http://localhost:4242/employers/${user.sub}` : `http://localhost:4242/seekers/${user.sub}`;
      const response = await fetch(endpoint,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ") : data.message || "Erreur dans la modification"
        );
      }

      // met à jour user stocké
      const updatedUser = {
        ...user,
        ...body,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Profil modifié avec succès !");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="page">
      <NavBar />

      <div className="form-card">

        {/* HEADER */}
        <div className="form-header">
          <h1>Modifier mon profil</h1>
          <p>Modifiez vos informations personnelles et professionnelles.</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="form">

          {/* PRENOM / NOM */}
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

          {/* EMAIL*/}

          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>

            <input
              id="email"
              type="email"
              placeholder="example@example.com"
              {...register("email", {
                required: "L'email est obligatoire",pattern: {value: /^\S+@\S+\.\S+$/,message: "Email invalide",}})}
            />

            {errors.email && (<span className="error">{errors.email.message}</span>)}
          </div>
          {/* SEEKER */}
          {isSeeker && (
            <>
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

                <div className="form-group">
                  <label htmlFor="experience">Expérience</label>

                  <input
                    id="experience"
                    type="text"
                    placeholder="Ex: 2 ans"
                    {...register("experience", {required:"L'expérience est obligatoire"})}
                  />

                  {errors.experience && (<span className="error">{errors.experience.message}</span>)}
                </div>

                <div className="form-group">
                  <label htmlFor="availability">Disponibilité</label>

                  <input
                    id="availability"
                    type="text"
                    placeholder="Ex: Temps plein"
                    {...register("availability", {required:"La disponibilité est obligatoire"})}
                  />

                  {errors.availability && (<span className="error">{errors.availability.message}</span>)}
                </div>
              </div>
            </>
          )}

          {/* RH */}
          {isRH && (
            <div className="input-row">

              <div className="form-group">
                <label htmlFor="companyName">Entreprise</label>

                <input
                  id="companyName"
                  type="text"
                  placeholder="Nom de votre entreprise"
                  {...register("companyName", {required:"Le nom de l'entreprise est obligatoire"})}
                />

                {errors.companyName && (<span className="error">{errors.companyName.message}</span>)}
              </div>

              <div className="form-group">
                <label htmlFor="companyDesc">Description de votre entreprise</label>

                <input
                  id="companyDesc"
                  type="text"
                  placeholder="Ex: Entreprise de sécurité"
                  {...register("companyDesc", {required:"La description est obligatoire",})}
                />

                {errors.companyDesc && (<span className="error">{errors.companyDesc.message}</span>)}
              </div>

            </div>
          )}

          {/* BUTTON */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <span> {isSubmitting ? "Modification..." : "Enregistrer les modifications"}</span>
            {!isSubmitting && (<span className="arrow">→</span>)}
          </button>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Se déconnecter
          </button>

        </form>

        {/* FOOTER */}
        <p className="form-footer"><Link to="/home">← Retour</Link></p>
      </div>
    </div>
  );
}