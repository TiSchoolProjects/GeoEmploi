import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
        const profileEndpoint =
          user.role === "employer"
            ? `http://localhost:4242/employers/${user.sub}` : `http://localhost:4242/seekers/${user.sub}`;

        const [userResponse, profileResponse] = await Promise.all([
          fetch(`http://localhost:4242/users/${user.sub}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }),

          fetch(profileEndpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }),
        ]);

        const userData = await userResponse.json();
        const profileData = await profileResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            Array.isArray(userData.message)
              ? userData.message.join(", ") : userData.message || "Impossible de récupérer l'utilisateur"
          );
        }

        if (!profileResponse.ok) {
          throw new Error(
            Array.isArray(profileData.message)
              ? profileData.message.join(", ") : profileData.message || "Impossible de récupérer le profil"
          );
        }

        reset({
          firstName: userData.firstname || "",
          lastName: userData.lastname || "",
          email: userData.email || "",

          skills: Array.isArray(profileData.skills) ? profileData.skills.join(", ") : profileData.skills || "",
          experience: profileData.experience || "",
          availability: profileData.availability || "",

          companyName: profileData.companyName || "",
          companyDesc: profileData.companyDesc || "",
        });
      } catch (error) {
        console.error(error);
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

      const userBody = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
      };

      const profileBody = {};

      if (isSeeker) {
        profileBody.skills = skills;
        profileBody.experience = formData.experience;
        profileBody.availability = formData.availability;
      }

      if (isRH) {
        profileBody.companyName = formData.companyName;
        profileBody.companyDesc = formData.companyDesc;
      }

      const userResponse = await fetch(`http://localhost:4242/users/${user.sub}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(userBody),
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          Array.isArray(userData.message)
            ? userData.message.join(", ") : userData.message || "Erreur dans la modification de l'utilisateur"
        );
      }

      const profileEndpoint = isRH ? `http://localhost:4242/employers/${user.sub}` : `http://localhost:4242/seekers/${user.sub}`;
      const profileResponse = await fetch(profileEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileBody),
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          Array.isArray(profileData.message)
            ? profileData.message.join(", ") : profileData.message || "Erreur dans la modification du profil"
        );
      }

      const updatedUser = {
        ...user,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profil modifié avec succès !");

      navigate("/profile");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
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