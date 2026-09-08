import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Map as MapLibreMap, Marker, Popup, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../CSS/MapPage.css'
import NavBar from "../components/Navbar";
import { apiFetch } from '../api/client'
setWorkerUrl(workerUrl)

export default function MapPage() {

  const [coordinates, setCoordinates] = useState([2.3522, 48.8566])
  const [position, setPosition] = useState("")
  const [jobOffers, setJobOffers] = useState([])
  const [searchError, setSearchError] = useState("")
  const [showLocationModal, setShowLocationModal] = useState(true)
  const [reportOffer, setReportOffer] = useState(null)
  const [reportReason, setReportReason] = useState("fraud")
  const [reportDescription, setReportDescription] = useState("")
  const [reportError, setReportError] = useState("")
  const [reportSuccess, setReportSuccess] = useState("")
  const [reportSending, setReportSending] = useState(false)

  const zoom = 13
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const mapLoadedRef = useRef(false)
  const markersRef = useRef([])
  const jobOffersRef = useRef([])
  const hasSearchedRef = useRef(false)
  const companyNamesRef = useRef({})
  const navigate = useNavigate()

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
  }

  const truncateDescription = (description, maxLength = 120) => {
    if (!description) return ""
    if (description.length <= maxLength) return description
    return `${description.substring(0, maxLength).trimEnd()}...`
  }

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const getCompanyName = async (offer) => {
    try {
      const response = await fetch(`http://localhost:4242/employers/${offer.employerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      return data.companyName || "Entreprise inconnue"
    } catch (error) {
      console.error("Erreur lors de la récupération du nom de l'entreprise :", error)
      return "Entreprise inconnue"
    }
  }

  const applyForJob = async (offer) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user) {
        return { ok: false, message: "Vous devez être connecté pour postuler." }
      }
      const userId = user.sub
      const token = localStorage.getItem("access_token")
      if (!token) {
        return { ok: false, message: "Vous devez être connecté pour postuler." }
      }
      const data = await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({
          jobId: offer.id,
          jobSeekerId: user.sub,
        }),
      });

      return { ok: true, message: data?.message || "Candidature envoyée avec succès." }
    } catch (error) {
      console.error("Erreur lors de l'application à l'offre :", error)
      return {
        ok: false,
        message: "Vous avez déjà postulé à cette offre."
      }
    }
  }

  const regView = async (offerId) => {
      await apiFetch(`/jobs/views/${offerId}`, { method: "PATCH",});
  }

  const submitReport = async (event) => {
    event.preventDefault()

    if (!reportOffer) {
      return;
    }
    
    setReportError("");
    setReportSuccess("");

    if (reportDescription.trim().length < 5) {
      setReportError("La description est trop courte.")
      return;
    }

    try {
      setReportSending(true);

      await apiFetch(`/reports/jobs/${reportOffer.id}`, {method: "POST",
      body: JSON.stringify({reason: reportReason, description: reportDescription.trim(),}),})

      setReportSuccess("Le signalement à été envoyé.")
      setReportDescription("")
    } catch (error) {
      console.error(error);
      setReportError(error.message || "Impossible d'envoyer le signalement.")
    } finally {
      setReportSending(false)
    }
  }

  const renderMarkersInView = () => {
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) return

    let bounds
    try {
      bounds = map.getBounds()
    } catch {
      return
    }

    clearMarkers()

    const offersByLngLat = new Map()

    jobOffersRef.current.forEach((offer, index) => {
      if (offer.lat == null || offer.lng == null) {
        return
      }

      const lngLat = [Number(offer.lng), Number(offer.lat)]
      const key = `${lngLat[0]},${lngLat[1]}`

      if (!offersByLngLat.has(key)) {
        offersByLngLat.set(key, { lngLat, offers: [] })
      }
      offersByLngLat.get(key).offers.push({ ...offer, index })
    })

    offersByLngLat.forEach(({ lngLat, offers }) => {
      if (!bounds.contains(lngLat)) {
        return
      }

      const user = JSON.parse(localStorage.getItem("user"))
      const role = user?.role

      const popupHtml = `
        <div class="jobOfferContainer">
          ${offers.map((offer) => {
            const offerId = offer.id ?? offer._id ?? offer.index
            const companyName = companyNamesRef.current[offer.employerId] ?? "Chargement..."
            const statusId = `applyStatus-${offerId}`
            const safeTitle = escapeHtml(offer.title);
            const safeDescription = escapeHtml(truncateDescription(offer.description));
            const safeCompanyName = escapeHtml(companyName);
            const safeOfferId = escapeHtml(offerId);
            const safeStatusId = escapeHtml(statusId);

            return `
              <div class="jobOfferPopup" data-offer-id="${safeOfferId}" role="group" aria-label="Offre d'emploi : ${safeTitle}">
                <h3>${safeTitle}</h3>
                <p>${safeDescription}</p> 
                <p><strong>Entreprise :</strong> ${safeCompanyName}</p>
                ${role === "seeker" ? `
                  <button
                    type="button"
                    class="jobDetailsBtn"
                    data-offer-id="${safeOfferId}"
                    aria-describedby="${safeStatusId}"
                  >
                    Postuler
                  </button>
                ` : ""}
                ${user ? `<button type="button" class="jobReportBtn" data-report-offer-id="${safeOfferId}"> Signaler cette offre </button>` : ""}
                <p
                  id="${safeStatusId}"
                  class="applyStatus"
                  role="alert"
                ></p>
              </div>
            `
          }).join('')}
        </div>
      `

      const popup = new Popup({ offset: 25, closeButton: true, maxWidth: 'none' }).setHTML(popupHtml)

      popup.on('open', () => {
        const popupEl = popup.getElement()
        if (!popupEl) return

        const closeBtn = popupEl.querySelector('.maplibregl-popup-close-button')
        if (closeBtn) {
          closeBtn.setAttribute('aria-label', "Fermer les détails de l'offre")
        }

        const detailsBtns = popupEl.querySelectorAll('.jobDetailsBtn')

        detailsBtns.forEach((detailsBtn) => {
          detailsBtn.addEventListener('click', async () => {
            const offerId = detailsBtn.getAttribute('data-offer-id')
            const offer = offers.find(
              (o) => String(o.id ?? o._id ?? o.index) === String(offerId)
            )
            const statusEl = popupEl.querySelector(`#applyStatus-${offerId}`)

            if (!user) {
              if (statusEl) {
                statusEl.textContent = "Vous devez être connecté pour postuler."
                statusEl.classList.add('applyStatus--error')
              }
              return
            }

            if (statusEl) {
              statusEl.textContent = ""
              statusEl.classList.remove('applyStatus--error', 'applyStatus--success')
            }

            detailsBtn.disabled = true
            detailsBtn.setAttribute('aria-busy', 'true')
            const initialLabel = detailsBtn.textContent
            detailsBtn.textContent = "Envoi en cours..."

            const result = await applyForJob(offer)

            detailsBtn.removeAttribute('aria-busy')

            if (result.ok) {
              detailsBtn.disabled = true
              detailsBtn.textContent = "Candidature envoyée"
            } else {
              detailsBtn.disabled = false
              detailsBtn.textContent = initialLabel
            }

            if (statusEl) {
              statusEl.textContent = result.message
              statusEl.classList.add(result.ok ? 'applyStatus--success' : 'applyStatus--error')
            }
          })
        })

        detailsBtns[0]?.focus()

        const reportBtns = popupEl.querySelectorAll('.jobReportBtn')

        reportBtns.forEach((reportBtn) => {
          reportBtn.addEventListener('click', (event) => {
            event.stopPropagation()

            const offerId = reportBtn.getAttribute('data-report-offer-id')

            const offer = offers.find((currentOffer) => String(currentOffer.id ?? currentOffer._id ?? currentOffer.index) === String(offerId))

            if (!offer) return

            setReportOffer(offer)
            setReportReason("fraud")
            setReportDescription("")
            setReportError("")
            setReportSuccess("")
          })
        })
      })

      const marker = new Marker()
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map)

      const markerElement = marker.getElement()

      let viewed = false

      markerElement.addEventListener('click', async () => {
        if (viewed) return

        viewed = true

        try {
          for (const offer of offers) {
            await regView(offer.id)
          }
        } catch (error) {
          console.error(error)
          viewed = false
        }
      })

      markerElement.setAttribute('tabindex', '0')
      markerElement.setAttribute(
        'aria-label',
        `Afficher ${offers.length === 1 ? "l'offre d'emploi" : "les offres d'emploi"} à cet endroit`
      )
      markerElement.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        marker.togglePopup()
      })

      markersRef.current.push(marker)
    })
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242";

  useEffect(() => {

    const map = new MapLibreMap({
      container: mapContainer.current,

      style: {
        version: 8,

        sources: {
          ign: {
            type: 'raster',
            tiles: [
              `${API_URL}/cartography/tiles/{z}/{x}/{y}`
            ],
            tileSize: 256
          }
        },

        layers: [
          {
            id: 'ign',
            type: 'raster',
            source: 'ign'
          }
        ]
      },

      center: coordinates,
      zoom: zoom
    })

    mapRef.current = map
    mapLoadedRef.current = false

    const handleLoad = () => {
      mapLoadedRef.current = true
      renderMarkersInView()
    }

    map.on('moveend', renderMarkersInView)
    map.on('load', handleLoad)

    const fetchJobOffers = async () => {
      try {
        const data = await apiFetch('/jobs');
        setJobOffers(data)
      } catch (error) {
        console.error('Erreur lors de la récupération des offres d\'emploi :', error)
      }
    }

    fetchJobOffers()

    return () => {
      map.off('moveend', renderMarkersInView)
      map.off('load', handleLoad)
      mapLoadedRef.current = false
      clearMarkers()
      map.remove()
      mapRef.current = null
    }

  }, [])

  const handleAcceptLocation = () => {
    setShowLocationModal(false)

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        if (hasSearchedRef.current) return

        const userCoordinates = [geoPosition.coords.longitude, geoPosition.coords.latitude]
        setCoordinates(userCoordinates)
        if (mapRef.current) {
          mapRef.current.setCenter(userCoordinates)
        }
      },
      (error) => {
        console.warn('Géolocalisation indisponible, position par défaut conservée :', error.message)
      }
    )
  }

  const handleDeclineLocation = () => {
    setShowLocationModal(false)
  }

  const searchLocation = async (e) => {
    e.preventDefault()

    if (!position.trim()) return

    setSearchError("")

    const response = await fetch(
      `http://localhost:4242/jobs/geocode?address=${encodeURIComponent(position)}`
    )

    const data = await response.json()

    if (data.GeocodingStatus != "valid" || !data.lat || !data.lng) {
      setSearchError("Commune ou ville introuvable. Veuillez réessayer.")
      return
    }

    hasSearchedRef.current = true

    const newCoordinates = [Number(data.lng), Number(data.lat)]

    setCoordinates(newCoordinates)

    if (mapRef.current) {
      mapRef.current.setCenter(newCoordinates)
    }

    console.log("Coordonnées :", newCoordinates)
  }

  useEffect(() => {
    jobOffersRef.current = jobOffers

    if (mapRef.current && mapLoadedRef.current) {
      renderMarkersInView()
    }

    const uniqueEmployerIds = [
      ...new Set(
        jobOffers
          .map((offer) => offer.employerId)
          .filter((id) => id != null && !(id in companyNamesRef.current))
      )
    ]

    if (uniqueEmployerIds.length === 0) return

    let cancelled = false

    Promise.all(
      uniqueEmployerIds.map(async (employerId) => {
        const name = await getCompanyName({ employerId })
        return [employerId, name]
      })
    ).then((entries) => {
      if (cancelled) return
      entries.forEach(([employerId, name]) => {
        companyNamesRef.current[employerId] = name
      })
      if (mapRef.current && mapLoadedRef.current) {
        renderMarkersInView()
      }
    })

    return () => {
      cancelled = true
    }
  }, [jobOffers])

  return (
    <div className="MapPage">
      <NavBar/>

      {showLocationModal && (
        <div className="locationModalOverlay">
          <div
            className="locationModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-modal-title"
          >
            <h2 id="location-modal-title">Utilisation de votre position</h2>

            <p>
              Avec votre autorisation, GéoEmploi utilise votre géolocalisation pour
              afficher les offres d'emploi les plus proches de vous.
            </p>

            <ul className="locationModalList">
              <li><strong>Données concernées :</strong> coordonnées GPS brutes (latitude, longitude).</li>
              <li><strong>Finalité :</strong> filtrer les offres d'emploi selon la distance géographique de l'utilisateur.</li>
              <li><strong>Base légale :</strong> votre consentement, exprimé via l'autorisation demandée par le navigateur.</li>
              <li><strong>Destinataires :</strong> équipe technique et produit de GéoEmploi (logs techniques) ; IGN pour les tuiles cartographiques et le géocodage (API Adresse / Géoplateforme).</li>
              <li><strong>Transfert hors UE :</strong> aucun ; données hébergées en France.</li>
              <li><strong>Durée de conservation :</strong> donnée volatile, utilisée uniquement le temps de la requête, sans stockage en base de données.</li>
              <li><strong>Vos droits :</strong> accès, effacement, limitation, et retrait du consentement à tout moment via les paramètres de géolocalisation de votre navigateur.</li>
            </ul>

            <div className="locationModalActions">
              <button type="button" className="locationModalDecline" onClick={handleDeclineLocation}>
                Refuser
              </button>
              <button type="button" className="locationModalAccept" onClick={handleAcceptLocation}>
                J'accepte
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="searchBar" onSubmit={searchLocation}>
      <label htmlFor="location-search" className="visuallyHidden">
          Rechercher une commune ou une ville
        </label>
        <input
        id="location-search"
        type="text"
          placeholder="Search a location"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          aria-describedby={searchError ? "location-search-error" : undefined}
        />
        <button type="submit">
          Rechercher
        </button>
      </form>
      {searchError && (
        <p id="location-search-error" className="searchError" role="alert">
          {searchError}
        </p>
      )}
      <div
        ref={mapContainer}
        className="map"
        role="application"
        aria-label="Carte des offres d'emploi"
      />
      {reportOffer && (
      <div
        className="report-modal-overlay"
        onClick={() => setReportOffer(null)}
      >
        <div
          className="report-modal"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="report-modal-close"
            onClick={() => setReportOffer(null)}
          >
            ×
          </button>

          <h2>Signaler cette offre</h2>

          <p>{reportOffer.title}</p>

          <form onSubmit={submitReport}>
            <div className="report-form-group">
              <label htmlFor="report-reason">
                Motif
              </label>

              <select
                id="report-reason"
                value={reportReason}
                onChange={(event) =>
                  setReportReason(event.target.value)
                }
              >
                <option value="fraud">
                  Offre frauduleuse
                </option>
              
                <option value="misleading">
                  Informations trompeuses
                </option>
              
                <option value="discriminatory">
                  Contenu discriminatoire
                </option>
              
                <option value="non_compliant">
                  Offre non conforme
                </option>
              
                <option value="other">
                  Autre
                </option>
              </select>
            </div>
              
            <div className="report-form-group">
              <label htmlFor="report-description">
                Description
              </label>
              
              <textarea
                id="report-description"
                rows="5"
                maxLength={1000}
                value={reportDescription}
                onChange={(event) =>
                  setReportDescription(event.target.value)
                }
                required
              />
            </div>
              
            {reportError && (
              <p className="report-message report-message--error">
                {reportError}
              </p>
            )}

            {reportSuccess && (
              <p className="report-message report-message--success">
                {reportSuccess}
              </p>
            )}

            <div className="report-modal-actions">
              <button
                type="button"
                onClick={() => setReportOffer(null)}
              >
                Annuler
              </button>
          
              <button
                type="submit"
                disabled={reportSending || Boolean(reportSuccess)}
              >
                {reportSending
                  ? "Envoi..."
                  : reportSuccess
                    ? "Signalement envoyé"
                    : "Envoyer"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  )
}
