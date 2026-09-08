import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/More.css";
import NavBar from "../components/Navbar";

const CGU_ARTICLES = [
  {
    id: "art1",
    num: "1",
    titre: "Préambule et présentation du service",
    corps: [
      "Le Ministère du Job et Bonheur met à disposition des usagers la plateforme numérique publique GéoEmploi. Ce service public d'intermédiation a pour mission de faciliter la mise en relation directe entre candidats et recruteurs en permettant la consultation géolocalisée d'offres d'emploi à l'échelle de la commune.",
      "Les présentes Conditions Générales d'Utilisation (CGU) déterminent les règles d'accès, d'utilisation et de protection des données régissant les relations entre l'Administration éditrice et les utilisateurs du service. Tout accès ou création de compte emporte adhésion pleine et entière aux présentes dispositions.",
    ],
  },
  {
    id: "art2",
    num: "2",
    titre: "Définitions",
    liste: [
      ["Plateforme", "Le service numérique GéoEmploi, accessible en ligne."],
      ["Candidat", "Toute personne physique accédant au service à des fins de recherche d'emploi, de consultation d'offres ou de candidature."],
      ["Employeur / Recruteur", "Toute personne morale ou professionnelle procédant à la publication d'annonces de recrutement via un compte dédié."],
      ["Données cartographiques", "Fonds cartographiques fournis par la Géoplateforme IGN et données d'adresses issues de l'API Adresse nationale (api-adresse.data.gouv.fr)."],
    ],
  },
  {
    id: "art3",
    num: "3",
    titre: "Accès au service et tarification employeurs",
    sousArticles: [
      {
        soustitre: "3.1. Accès candidats",
        corps: [
          "L'ensemble des fonctionnalités mises à disposition des candidats — consultation de la carte, affichage des annonces, calcul de proximité et transmission de candidatures — est strictement gratuit et libre de tout abonnement.",
        ],
      },
    ],
  },
  {
    id: "art4",
    num: "4",
    titre: "Géolocalisation et respect de la vie privée",
    sousArticles: [
      {
        soustitre: "4.1. Traitement transitoire et absence de stockage GPS",
        corps: [
          "Pour bénéficier du tri d'offres par proximité géographique, l'utilisateur peut activer la localisation de son appareil via l'API de son navigateur. Cette action requiert une autorisation technique expresse.",
          "Aucune coordonnée GPS d'utilisateur n'est stockée, enregistrée ou tracée dans les bases de données ou les journaux applicatifs du Ministère. Le calcul de distance par rapport aux offres s'effectue exclusivement de façon transitoire et volatile en mémoire vive pendant la durée de la session active.",
        ],
      },
      {
        soustitre: "4.2. Alternative sans localisation",
        corps: [
          "L'autorisation de localisation est facultative. En cas de refus, l'utilisateur bénéficie de l'intégralité des fonctionnalités en saisissant manuellement une commune ou un code postal de référence.",
        ],
      },
      {
        soustitre: "4.3. Protection des adresses des employeurs",
        corps: [
          "Afin de préserver la tranquillité des établissements employeurs, les adresses postales exactes ne sont pas affichées sur la carte publique : seule la commune de rattachement de l'offre est visible des usagers.",
        ],
      },
    ],
  },
  {
    id: "art5",
    num: "5",
    titre: "Protection des données personnelles et exercice des droits",
    sousArticles: [
      {
        soustitre: "5.1. Catégories de données collectées à l'inscription",
        corps: [
          "En application du principe de minimisation (Art. 5.1.c RGPD), GéoEmploi collecte uniquement les données strictement nécessaires à l'intermédiation pour l'emploi :",
        ],
        liste: [
          ["Candidat", "Nom, prénom, adresse e-mail de contact, mot de passe sécurisé (chiffré/haché), document de CV (format PDF/DOC)."],
          ["Employeur", "Raison sociale, numéro SIRET, adresse de siège, nom/prénom du gestionnaire, adresse e-mail professionnelle, numéro de téléphone."],
        ],
      },
      {
        soustitre: "5.2. Durées de conservation",
        table: [
          ["Données de profil et candidatures", "Durée d'utilisation active, puis suppression après 2 ans d'inactivité continue"],
          ["Logs de connexion", "IP anonymisées sous 24 h, logs techniques purgés sous 12 mois"],
          ["Données GPS", "Rétention de 0 seconde (calcul transitoire, sans archivage)"],
        ],
      },
      {
        soustitre: "5.3. Modalités concrètes d'exercice des droits",
        corps: [
          "Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, chaque utilisateur dispose d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition au traitement de ses données.",
        ],
        liste: [
          ["Autonomie directe", "Modification des informations ou suppression immédiate du compte depuis « Mon Compte » > « Supprimer mon compte »."],
          ["Saisine du DPO", "Par e-mail à dpo@job-et-bonheur.fr. Réponse sous un délai légal maximal d'un mois."],
          ["Droit de réclamation", "Auprès de la CNIL (www.cnil.fr) en cas de non-respect des droits."],
        ],
      },
    ],
  },
  {
    id: "art7",
    num: "7",
    titre: "Responsabilités",
    corps: [
      "Le Ministère met en œuvre les diligences requises pour assurer la disponibilité et la sécurité du service. Sa responsabilité ne saurait être engagée en cas de force majeure, d'interruption temporaire pour maintenance, d'inexactitude dans les annonces rédigées par les employeurs ou d'issue négative à une candidature.",
    ],
  },
  {
    id: "art8",
    num: "8",
    titre: "Droit applicable et juridiction compétente",
    corps: [
      "Les présentes CGU sont régies par le droit français. À défaut de résolution amiable, tout différend relatif à leur validité ou leur exécution sera soumis aux tribunaux français territorialement compétents.",
    ],
  },
];

const TRANS_ARTICLES = [
  {
    id: "art1",
    num: "1",
    titre: "Publication gratuite",
    corps: [
      "La publication d'une offre d'emploi sur GéoEmploi est entièrement gratuite.",
      "Aucun abonnement, tarif ou contrepartie financière n'est demandé aux employeurs pour publier une offre."
    ],
  },
  {
    id: "art2",
    num: "2",
    titre: "Localisation des offres",
    corps: [
      "Les offres d'emploi sont localisées à la maille de la commune. Elles sont positionnées sur le centre de leur commune et non à leur adresse exacte.",
      "La position de l'utilisateur peut être utilisée pour lui permettre de consulter les offres à proximité. Cette position n'est pas conservée par GéoEmploi.",
      "Les seules données de localisation conservées concernent la localisation associée aux offres d'emploi."
    ],
  },
  {
    id: "art3",
    num: "3",
    titre: "Conservation des données de localisation",
    corps: [
      "La position des utilisateurs n'est pas enregistrée ni conservée.",
      "Les données de localisation associées aux offres d'emploi sont conservées conformément aux règles définies dans le registre des traitements.",
      " Les historiques de localisation des offres sont automatiquement supprimés au-delà de 90 jours"
    ],
  },
  {
    id: "art4",
    num: "4",
    titre: "Protection des données",
    corps: [
      "GéoEmploi applique le principe de minimisation des données : seules les données nécessaires au fonctionnement du service sont collectées et conservées.",
      "Pour toute question concernant la protection de vos données personnelles ou l'exercice de vos droits, vous pouvez contacter le délégué à la protection des données (DPO) : dpo@job-et-bohneur.fr",
    ],
  },
];

function ContentBlock({ node }) {
  return (
    <div className="content-block">
      {node.soustitre && <h4 className="content-under-title">{node.soustitre}</h4>}
      {node.corps && node.corps.map((p, i) => (<p className="content-paragraphe" key={i}>{p}</p>))}
      {node.liste && (
        <dl className="content-list">
          {node.liste.map(([term, def], i) => (
            <div className="content-list-item" key={i}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      )}
      {node.table && (
        <div className="content-table">
          {node.table.map(([label, val], i) => (
            <div className="content-table-row" key={i}>
              <div className="content-table-label">{label}</div>
              <div className="content-table-value">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function More() {
  const [activeTab, setActiveTab] = useState("reports")
  const [activeArticle, setActiveArticle] = useState(CGU_ARTICLES[0].id);
  const articleRefs = useRef({});

  useEffect(() => {
    if (activeTab !== "cgu") return;
    const observer = new IntersectionObserver(
      (entries) => {entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActiveArticle(entry.target.id);
        });
      },
    );
    Object.values(articleRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab]);

  const scrollToArticle = (id) => {
    articleRefs.current[id]?.scrollIntoView({behavior: "smooth", block: "start" });
  };

  return (
    <>
      <NavBar />

      <main className="more-page">
        <header className="more-header">
          <h1>Informations</h1>
          <p>Conditions d'utilisation et transparence de GéoEmploi</p>
        </header>

        <nav className="more-tabs">
          <button
            type="button"
            className={activeTab === "cgu" ? "active" : ""}
            onClick={() => setActiveTab("cgu")}
          >
            CGU
          </button>

          <button
            type="button"
            className={activeTab === "transparence" ? "active" : ""}
            onClick={() => setActiveTab("transparence")}
          >
            Transparence
          </button>
        </nav>

        {activeTab === "cgu" && (
          <section className="more-section">
            <h2>Conditions générales d'utilisation</h2>

            <div className="content-layout">
              <nav className="content-summary">
                <p className="content-summary-titre">sommaire</p>
                {CGU_ARTICLES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={"content-summary-item" + (activeArticle === a.id ? " active" : "")}
                    onClick={() => scrollToArticle(a.id)}
                  >
                    Art. {a.num} — {a.titre}
                  </button>
                ))}
              </nav>

              <div className="content-content">
                {CGU_ARTICLES.map((a) => (
                  <section
                    key={a.id}
                    id={a.id}
                    ref={(el) => (articleRefs.current[a.id] = el)}
                    className="content-article"
                  >
                    <div className="content-article-header">
                      <span className="content-article-num">Article {a.num}</span>
                      <h3>{a.titre}</h3>
                    </div>
                    {a.corps && <ContentBlock node={{ corps: a.corps }} />}
                    {a.liste && <ContentBlock node={{ liste: a.liste }} />}
                    {a.sousArticles && a.sousArticles.map((s, i) => <ContentBlock key={i} node={s} />)}
                  </section>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "transparence" && (
          <section className="more-section">
            <h2>Transparance</h2>
            <div className="under-title">
              <p>GéoEmploi est un service permettant de consulter des offres d'emploi, de candidater et, pour les employeurs, de publier gratuitement des offres.</p>
            </div>
            <div className="content-layout">
              <nav className="content-summary">
                <p className="content-summary-title"></p>sommaire
                {TRANS_ARTICLES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={"content-summary-item" + (activeArticle === a.id ? " active" : "")}
                    onClick={() => scrollToArticle(a.id)}
                  >
                    Art. {a.num} — {a.titre}
                  </button>
                ))}
              </nav>

              <div className="content-contenu">
                {TRANS_ARTICLES.map((a) => (
                  <section
                    key={a.id}
                    id={a.id}
                    ref={(el) => (articleRefs.current[a.id] = el)}
                    className="content-article"
                  >
                    <div className="content-article-header">
                      <span className="content-article-num">Article {a.num}</span>
                      <h3>{a.titre}</h3>
                    </div>
                    {a.corps && <ContentBlock node={{ corps: a.corps }} />}
                    {a.liste && <ContentBlock node={{ liste: a.liste }} />}
                    {a.sousArticles && a.sousArticles.map((s, i) => <ContentBlock key={i} node={s} />)}
                  </section>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}