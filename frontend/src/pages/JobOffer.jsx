import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../CSS/Form.css";
import NavBar from "../components/Navbar";
import { useState } from "react";
import { apiFetch } from "../api/client";
import { useTranslation } from "react-i18next";

export default function JobOffer() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const onSubmit = async (data) => {
    try {
      await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          commune: data.commune,
          employerId: user.sub,
        }),
      });

      toast.success(t("jobOffer.createSuccess"));
      navigate("/map");
    } catch (error) {
      toast.error(t("jobOffer.createError"));
      console.error("Post Failed :", error);
    }
  };

  return (
    <div className="page">
      <NavBar />
      <div className="form-card">
        <div className="form-header">
          <h1>{t("jobOffer.title")}</h1>
        </div>

        {authError && <div className="server-error">{authError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="title">{t("jobOffer.jobTitleLabel")}</label>
            <input
              id="title"
              type="text"
              placeholder={t("jobOffer.jobTitlePlaceholder")}
              {...register("title", { required: t("jobOffer.validation.titleRequired") })}
            />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="description">{t("jobOffer.descriptionLabel")}</label>
            <textarea
              id="description"
              placeholder={t("jobOffer.descriptionPlaceholder")}
              rows="6"
              {...register("description", { required: t("jobOffer.validation.descRequired") })}
            />
            {errors.description && <span className="error">{errors.description.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="commune">{t("jobOffer.communeLabel")}</label>
            <input
              id="commune"
              type="text"
              placeholder={t("jobOffer.communePlaceholder")}
              {...register("commune", { required: t("jobOffer.validation.communeRequired") })}
            />
            {errors.commune && <span className="error">{errors.commune.message}</span>}
          </div>
          <button type="submit" className="submit-btn">
            <span>{t("jobOffer.submit")}</span>
            <span className="arrow">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}