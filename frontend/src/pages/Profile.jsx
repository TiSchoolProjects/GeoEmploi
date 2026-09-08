import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "../CSS/Form.css";
import "../CSS/PrivacyNotice.css";
import NavBar from "../components/Navbar";
import GeoConsentNotice from "./GeoconsentNotice";
import { getToken, logout } from "../utils/auth";
import { apiFetch } from "../api/client";
import { getGeoConsent, setGeoConsent } from "./Consent";

export default function EditProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [geoConsent, setGeoConsentState] = useState(() => getGeoConsent());

  const handleChangeConsent = (status) => {
    const value = setGeoConsent(status);
    setGeoConsentState(value);
    toast.success(
      status === "accepted"
        ? t("profile.consentAcceptedToast")
        : t("profile.consentDeclinedToast")
    );
  };


  const token = getToken();
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const getProfile = async () => {
      if (!user || !token) {
        navigate("/login");
        return;
      }

      try {
        const profileEndpoints = {
          admin: `/admins/${user.sub}`,
          employer: `/employers/${user.sub}`,
          seeker: `/seekers/${user.sub}`,
        };
        const profileEndpoint = profileEndpoints[user.role];
        if (!profileEndpoint) {
          throw new Error(t("profile.unsupportedRole", { role: user.role }));
        }

        const [userData, profileData] = await Promise.all([
          apiFetch(`/users/${user.sub}`),
          apiFetch(profileEndpoint),
        ]);

        reset({
          firstName: userData.firstname || "",
          lastName: userData.lastname || "",
          email: userData.email || "",
          // Seekr
          skills: Array.isArray(profileData.skills) ? profileData.skills.join(", ") : profileData.skills || "",
          experience: profileData.experience || "",
          availability: profileData.availability || "",

          //employer
          companyName: profileData.companyName || "",
          companyDesc: profileData.companyDesc || "",
        });
      } catch (error) {
        console.error("Erreur récupération profil :", error);

        toast.error(
          error.message || t("profile.fetchProfileError")
        );
      }
    };

    getProfile();
  }, [navigate, reset, token, user, t]);

  if (!user) {
    return null;
  }

  const ProfileDelete = async (userId) => {
    const result = await Swal.fire({
      title: t("profile.deleteAccountTitle"),
      text: t("profile.deleteAccountText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("profile.deleteAccountConfirm"),
      cancelButtonText: t("profile.deleteAccountCancel"),
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await apiFetch(`/users/${userId}`, { method: "DELETE" });

      toast.success(t("profile.deleteAccountSuccess"));
      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(t("profile.deleteAccountError"));
    }
  };

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

      const userData = await apiFetch(`/users/${user.sub}`, {
        method: "PATCH",
        body: JSON.stringify(userBody),
      });

      if (!userData) {
        throw new Error(
          Array.isArray(userData.message)
            ? userData.message.join(", ") : userData.message || t("profile.userUpdateError")
        );
      }

      const profileEndpoint = isRH ? `/employers/${user.sub}` : `/seekers/${user.sub}`;
      const profileData = await apiFetch(profileEndpoint, {
        method: "PATCH",
        body: JSON.stringify(profileBody),
      });

      if (!profileData) {
        throw new Error(
          Array.isArray(profileData.message)
            ? profileData.message.join(", ") : profileData.message || t("profile.profileUpdateError")
        );
      }

      const updatedUser = {
        ...user,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(t("profile.saveSuccess"));

      navigate("/profile");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExportData = async () => {
    try {
      const exportData = await apiFetch(`/export/json`, {
        method: "GET"
      })

      if (!exportData) {
        throw new Error(t("profile.exportEmptyError"));
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `mes-donnees-${user.sub}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("profile.exportSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(error.message || t("profile.exportError"));
    }
  };

  return (
    <div className="page">
      <NavBar />

      <div className="form-card">

        {/* HEADER */}
        <div className="form-header">
          <h1>{t("profile.pageTitle")}</h1>
          <p>{t("profile.subtitle")}</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="form">

          {/* PRENOM / NOM */}
          <div className="input-row">

            <div className="form-group">
              <label htmlFor="firstName">{t("profile.firstNameLabel")}</label>

              <input
                id="firstName"
                type="text"
                placeholder={t("profile.firstNamePlaceholder")}
                {...register("firstName", {required: t("profile.firstNameRequired"),})}
              />
              {errors.firstName && (<span className="error">{errors.firstName.message}</span>)}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">{t("profile.lastNameLabel")}</label>
              <input
                id="lastName"
                type="text"
                placeholder={t("profile.lastNamePlaceholder")}
                {...register("lastName", {required: t("profile.lastNameRequired"),})}
              />
              {errors.lastName && (<span className="error">{errors.lastName.message}</span>)}
            </div>
          </div>

          {/* EMAIL*/}

          <div className="form-group">
            <label htmlFor="email">{t("profile.emailLabel")}</label>

            <input
              id="email"
              type="email"
              placeholder={t("profile.emailPlaceholder")}
              {...register("email", {
                required: t("profile.emailRequired"),pattern: {value: /^\S+@\S+\.\S+$/,message: t("profile.emailInvalid"),}})}
            />

            {errors.email && (<span className="error">{errors.email.message}</span>)}
          </div>
          {/* SEEKER */}
          {isSeeker && (
            <>
              <div className="form-group">
                <label htmlFor="skills">{t("profile.skillsLabel")}</label>

                <input
                  id="skills"
                  type="text"
                  placeholder={t("profile.skillsPlaceholder")}
                  {...register("skills", {required:t("profile.skillsRequired"),})}
                />

                {errors.skills && (<span className="error">{errors.skills.message}</span>)}
              </div>

              <div className="input-row">

                <div className="form-group">
                  <label htmlFor="experience">{t("profile.experienceLabel")}</label>

                  <input
                    id="experience"
                    type="text"
                    placeholder={t("profile.experiencePlaceholder")}
                    {...register("experience", {required:t("profile.experienceRequired")})}
                  />

                  {errors.experience && (<span className="error">{errors.experience.message}</span>)}
                </div>

                <div className="form-group">
                  <label htmlFor="availability">{t("profile.availabilityLabel")}</label>

                  <input
                    id="availability"
                    type="text"
                    placeholder={t("profile.availabilityPlaceholder")}
                    {...register("availability", {required:t("profile.availabilityRequired")})}
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
                <label htmlFor="companyName">{t("profile.companyNameLabel")}</label>

                <input
                  id="companyName"
                  type="text"
                  placeholder={t("profile.companyNamePlaceholder")}
                  {...register("companyName", {required:t("profile.companyNameRequired")})}
                />

                {errors.companyName && (<span className="error">{errors.companyName.message}</span>)}
              </div>

              <div className="form-group">
                <label htmlFor="companyDesc">{t("profile.companyDescLabel")}</label>

                <input
                  id="companyDesc"
                  type="text"
                  placeholder={t("profile.companyDescPlaceholder")}
                  {...register("companyDesc", {required:t("profile.companyDescRequired"),})}
                />

                {errors.companyDesc && (<span className="error">{errors.companyDesc.message}</span>)}
              </div>

            </div>
          )}

          {/* BUTTON */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <span> {isSubmitting ? t("profile.saving") : t("profile.saveButton")}</span>
            {!isSubmitting && (<span className="arrow">→</span>)}
          </button>
          
          <button type="button" className="logout-btn" onClick={handleLogout}>
            {t("profile.logoutButton")}
          </button>

        </form>

        <div className="export-btn">
          <button type="button" onClick={handleExportData}>
            {t("profile.exportButton")}
          </button>
        </div>

        {/* CONFIDENTIALITÉ / CONSENTEMENT GÉOLOCALISATION */}
        <div className="privacySection">
          <h2>{t("profile.privacyHeading")}</h2>
          <p>
            {t("profile.privacyText")}
          </p>

          <div className="consentStatus">
            {t("profile.consentStatusLabel")}
            <span
              className={`consentBadge ${
                geoConsent?.status === "accepted"
                  ? "consentBadge--accepted"
                  : geoConsent?.status === "declined"
                    ? "consentBadge--declined"
                    : "consentBadge--unset"
              }`}
            >
              {geoConsent?.status === "accepted"
                ? t("profile.consentAccepted")
                : geoConsent?.status === "declined"
                  ? t("profile.consentDeclined")
                  : t("profile.consentUnset")}
            </span>
          </div>

          <div className="privacyActions">
            <button
              type="button"
              className="privacyNoticeLink"
              onClick={() => setShowPrivacyNotice(true)}
            >
              {t("profile.viewNoticeButton")}
            </button>
            <button
              type="button"
              className="locationModalAccept"
              onClick={() => handleChangeConsent("accepted")}
              disabled={geoConsent?.status === "accepted"}
            >
              {t("profile.allowGeoButton")}
            </button>
            <button
              type="button"
              className="locationModalDecline"
              onClick={() => handleChangeConsent("declined")}
              disabled={geoConsent?.status === "declined"}
            >
              {t("profile.declineGeoButton")}
            </button>
          </div>
        </div>

        {showPrivacyNotice && (
          <div
            className="locationModalOverlay"
            onClick={() => setShowPrivacyNotice(false)}
          >
            <div
              className="locationModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="privacy-notice-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="privacy-notice-title">{t("profile.noticeTitle")}</h2>

              <p>
                {t("profile.noticeIntro")}
              </p>

              <GeoConsentNotice />

              <div className="locationModalActions">
                <button
                  type="button"
                  className="locationModalAccept"
                  onClick={() => setShowPrivacyNotice(false)}
                >
                  {t("profile.closeButton")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <p className="form-footer"><Link to="/home">{t("profile.backLink")}</Link></p>
        <button type="button" className="form-footer-button" onClick={() => ProfileDelete(user.sub)}>
            {t("profile.deleteAccountButton")}
          </button>
      </div>
    </div>
  );
}