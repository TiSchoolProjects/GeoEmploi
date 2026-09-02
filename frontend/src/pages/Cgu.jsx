import React from "react";
import { Link } from "react-router-dom";
import "../CSS/Cgu.css";
import NavBar from "../components/Navbar";

function Cgu() {
  return (
    <div className="cgu">
      {/* NAVBAR */}
      <NavBar />

      {/* CONTENU */}
      <main className="cgu-container">
        <header className="cgu-header">
          <h1>Conditions Générales d'Utilisation</h1>
          <p className="cgu-intro">
            Bienvenue sur notre site. Les présentes Conditions Générales
            d'Utilisation définissent les règles applicables à l'utilisation
            de notre plateforme.
          </p>
        </header>

        <section className="cgu-section">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation ont pour objet
            de définir les conditions dans lesquelles les utilisateurs
            peuvent accéder au site et utiliser les services proposés.
          </p>
          <p>
            Toute utilisation du site implique l'acceptation pleine et
            entière des présentes conditions. Si vous n'acceptez pas ces
            conditions, nous vous invitons à ne pas utiliser le site.
          </p>
        </section>

        <section className="cgu-section">
          <h2>2. Accès au site</h2>
          <p>
            Le site est accessible gratuitement à tout utilisateur disposant
            d'un accès à Internet. Les éventuels frais liés à l'accès au
            réseau, notamment les frais de connexion ou de matériel, restent
            à la charge de l'utilisateur.
          </p>
          <p>
            Nous nous réservons le droit de modifier, suspendre ou interrompre
            temporairement tout ou partie du site, notamment pour des raisons
            de maintenance ou de mise à jour.
          </p>
        </section>

        <section className="cgu-section">
          <h2>3. Utilisation du service</h2>
          <p>
            L'utilisateur s'engage à utiliser le site de manière responsable
            et conforme aux lois et règlements en vigueur.
          </p>

          <ul>
            <li>
              Ne pas utiliser le site à des fins frauduleuses ou illégales.
            </li>
            <li>
              Ne pas tenter de perturber le fonctionnement du site.
            </li>
            <li>
              Ne pas porter atteinte aux droits ou à la sécurité d'autres
              utilisateurs.
            </li>
            <li>
              Ne pas introduire de contenu malveillant ou susceptible
              d'endommager le service.
            </li>
          </ul>
        </section>

        <section className="cgu-section">
          <h2>4. Compte utilisateur</h2>
          <p>
            Lorsque la création d'un compte est nécessaire pour accéder à
            certains services, l'utilisateur s'engage à fournir des
            informations exactes, complètes et à jour.
          </p>
          <p>
            L'utilisateur est responsable de la confidentialité de ses
            identifiants de connexion et de toute activité effectuée depuis
            son compte.
          </p>
        </section>

        <section className="cgu-section">
          <h2>5. Propriété intellectuelle</h2>
          <p>
            L'ensemble des éléments présents sur le site, notamment les
            textes, images, logos, graphismes, interfaces, contenus et
            logiciels, sont protégés par les dispositions relatives à la
            propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification ou exploitation
            de tout ou partie du site sans autorisation préalable est
            susceptible de constituer une violation des droits de propriété
            intellectuelle.
          </p>
        </section>

        <section className="cgu-section">
          <h2>6. Responsabilité</h2>
          <p>
            Nous mettons tout en œuvre pour assurer l'exactitude et la
            disponibilité des informations présentes sur le site. Toutefois,
            nous ne pouvons garantir que le site sera disponible en
            permanence ou exempt d'erreurs.
          </p>
          <p>
            L'utilisateur reconnaît utiliser le site sous sa propre
            responsabilité et reste responsable de son matériel, de sa
            connexion Internet et de l'utilisation qu'il fait des services.
          </p>
        </section>

        <section className="cgu-section">
          <h2>7. Données personnelles</h2>
          <p>
            Dans le cadre de l'utilisation du site, certaines données
            personnelles peuvent être collectées et traitées.
          </p>
          <p>
            Ces traitements sont réalisés conformément à la réglementation
            applicable en matière de protection des données personnelles.
          </p>
          <p>
            Pour plus d'informations, veuillez consulter notre politique de
            confidentialité.
          </p>
        </section>

        <section className="cgu-section">
          <h2>8. Liens externes</h2>
          <p>
            Le site peut contenir des liens vers des sites ou services
            externes. Nous ne sommes pas responsables du contenu, de la
            disponibilité ou des pratiques de ces sites tiers.
          </p>
        </section>

        <section className="cgu-section">
          <h2>9. Modification des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier les présentes Conditions
            Générales d'Utilisation à tout moment afin de les adapter à
            l'évolution du site, de ses services ou de la réglementation.
          </p>
          <p>
            Les nouvelles conditions prennent effet dès leur publication sur
            le site.
          </p>
        </section>

        <section className="cgu-section">
          <h2>10. Droit applicable</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation sont soumises au
            droit applicable dans le pays où est établi l'éditeur du site.
          </p>
          <p>
            En cas de litige, les parties s'efforceront de rechercher une
            solution amiable avant toute procédure judiciaire.
          </p>
        </section>

        <section className="cgu-section cgu-contact">
          <h2>11. Contact</h2>
          <p>
            Pour toute question concernant les présentes Conditions Générales
            d'Utilisation, vous pouvez nous contacter via les moyens de
            contact disponibles sur notre site.
          </p>
        </section>

        <footer className="cgu-footer">
          <Link to="/" className="cgu-back">
            <span>←</span>
            Retour à l'accueil
          </Link>

          <p>Dernière mise à jour : 1 septembre 2026</p>
        </footer>
      </main>
    </div>
  );
}

export default Cgu;