import { useForm } from "react-hook-form";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../CSS/Form.css";
import NavBar from "../components/Navbar";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
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
          .filter(Boolean);

        const seekerResponse = await fetch("http://localhost:4242/auth/register/seeker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: formData.firstName,
            lastname: formData.lastName,
            email: formData.email,
            password: formData.password,
            skills,
            experience: formData.experience,
            availability: formData.availability,
          }),
        });

        if (!seekerResponse.ok) {
          throw new Error(t("register.seekerCreateError"));
        }

        toast.success(t("register.createSuccess"));
        navigate("/login");
      }

      if (isRH) {
        const employerResponse = await fetch("http://localhost:4242/auth/register/employer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: formData.firstName,
            lastname: formData.lastName,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            companyDesc: formData.companyDesc,
          }),
        });

        const data = await employerResponse.json();

        if (!employerResponse.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message || t("register.rhCreateError")
          );
        }

        toast.success(t("register.createSuccess"));
        navigate("/login");
      }
    } catch (error) {
      toast.error(t("register.createError"));
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
            <h1>{t("register.invalidRoleTitle")}</h1>
            <p>{t("register.invalidRoleText")}</p>
          </div>
          <Link to="/account" className="submit-btn">{t("register.backButton")}</Link>
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
          <h1>{isSeeker ? t("register.titleSeeker") : t("register.titleRH")}</h1>
          <p>{t("register.subtitle")}</p>
        </div>

        {/*FORM*/}
        <form onSubmit={handleSubmit(onSubmit)} className="form">

          {/*FIRST NAME / LAST NAME*/}
          <div className="input-row">
            <div className="form-group">
              <label htmlFor="firstName">{t("register.firstNameLabel")}</label>
              <input
                id="firstName"
                type="text"
                placeholder={t("register.firstNamePlaceholder")}
                {...register("firstName", { required: t("register.firstNameRequired") })}
              />
              {errors.firstName && <span className="error">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">{t("register.lastNameLabel")}</label>
              <input
                id="lastName"
                type="text"
                placeholder={t("register.lastNamePlaceholder")}
                {...register("lastName", { required: t("register.lastNameRequired") })}
              />
              {errors.lastName && <span className="error">{errors.lastName.message}</span>}
            </div>
          </div>

          {/*EMAIL*/}
          <div className="input-row">
            <div className="form-group">
              <label htmlFor="email">{t("register.emailLabel")}</label>
              <input
                id="email"
                type="email"
                placeholder={t("register.emailPlaceholder")}
                {...register("email", {
                  required: t("register.emailRequired"),
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: t("register.emailInvalid"),
                  },
                })}
              />
              {errors.email && <span className="error">{errors.email.message}</span>}
            </div>

            {/*PASSWORD*/}
            <div className="form-group">
              <label htmlFor="password">{t("register.passwordLabel")}</label>
              <input
                id="password"
                type="password"
                placeholder={t("register.passwordPlaceholder")}
                {...register("password", {
                  required: t("register.passwordRequired"),
                })}
              />
              {errors.password && <span className="error">{errors.password.message}</span>}
            </div>
          </div>

          {/*SEEKER ONLY FIELDS*/}
          {isSeeker && (
            <>
              {/* SKILLS */}
              <div className="form-group">
                <label htmlFor="skills">{t("register.skillsLabel")}</label>
                <input
                  id="skills"
                  type="text"
                  placeholder={t("register.skillsPlaceholder")}
                  {...register("skills", { required: t("register.skillsRequired") })}
                />
                {errors.skills && <span className="error">{errors.skills.message}</span>}
              </div>

              <div className="input-row">
                {/* EXPERIENCE */}
                <div className="form-group">
                  <label htmlFor="experience">{t("register.experienceLabel")}</label>
                  <input
                    id="experience"
                    type="text"
                    placeholder={t("register.experiencePlaceholder")}
                    {...register("experience", { required: t("register.experienceRequired") })}
                  />
                  {errors.experience && (
                    <span className="error">{errors.experience.message}</span>
                  )}
                </div>

                {/* AVAILABILITY */}
                <div className="form-group">
                  <label htmlFor="availability">{t("register.availabilityLabel")}</label>
                  <input
                    id="availability"
                    type="text"
                    placeholder={t("register.availabilityPlaceholder")}
                    {...register("availability", { required: t("register.availabilityRequired") })}
                  />
                  {errors.availability && (
                    <span className="error">{errors.availability.message}</span>
                  )}
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
                  <label htmlFor="companyName">{t("register.companyNameLabel")}</label>
                  <input
                    id="companyName"
                    type="text"
                    placeholder={t("register.companyNamePlaceholder")}
                    {...register("companyName", { required: t("register.companyNameRequired") })}
                  />
                  {errors.companyName && (
                    <span className="error">{errors.companyName.message}</span>
                  )}
                </div>

                {/* POSITION / DESC */}
                <div className="form-group">
                  <label htmlFor="companyDesc">{t("register.companyDescLabel")}</label>
                  <input
                    id="companyDesc"
                    type="text"
                    placeholder={t("register.companyDescPlaceholder")}
                    {...register("companyDesc", { required: t("register.companyDescRequired") })}
                  />
                  {errors.companyDesc && (
                    <span className="error">{errors.companyDesc.message}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/*SUBMIT*/}
          <button type="submit" className="submit-btn">
            <span>{isSeeker ? t("register.submitSeeker") : t("register.submitRH")}</span>
            <span className="arrow"> →</span>
          </button>
        </form>

        {/*FOOTER */}
        <p className="form-footer">
          {t("register.alreadyAccount")}{" "}
          <Link to="/login">{t("register.loginLink")}</Link>
        </p>
      </div>
    </div>
  );
}