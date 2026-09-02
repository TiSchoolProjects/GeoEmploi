import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Map, Marker, Popup, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../CSS/MapPage.css'
import NavBar from "../components/Navbar";

setWorkerUrl(workerUrl)

export default function MapPage() {

  const [coordinates, setCoordinates] = useState([2.3522, 48.8566])
  const [position, setPosition] = useState("")
  const [jobOffers, setJobOffers] = useState([])
  const [searchError, setSearchError] = useState("")

  const zoom = 13
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const jobOffersRef = useRef([])
  const hasSearchedRef = useRef(false)
  const companyNamesRef = useRef({})
  const navigate = useNavigate()

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
  }

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
    try  {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user) {
        console.error("Utilisateur non connecté")
        return
      }
      const userId = user.sub
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("Token d'authentification manquant")
        return
      }
      const response = await fetch(`http://localhost:4242/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobSeekerId: userId,
          jobId: offer.id ?? offer._id ?? ""
        })
      })
    } catch (error) {
      console.error("Erreur lors de l'application à l'offre :", error)
    }
  }

  const renderMarkersInView = () => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    const bounds = map.getBounds()

    jobOffersRef.current.forEach((offer, index) => {
      if (offer.lat == null || offer.lng == null) {
        return
      }

      const lngLat = [Number(offer.lng), Number(offer.lat)]

      if (!bounds.contains(lngLat)) {
        return
      }

      const offerId = offer.id ?? offer._id ?? index
      const companyName = companyNamesRef.current[offer.employerId] ?? "Chargement..."
      const popupHtml = `
        <div class="jobOfferPopup" role="group" aria-label="Offre d'emploi : ${offer.title}">
          <h3>${offer.title}</h3>
          <p>${offer.description}</p>
          <p><strong>Entreprise :</strong> ${companyName}</p>
          <button
            type="button"
            class="jobDetailsBtn"
            data-offer-id="${offerId}"
          >
            Postuler
          </button>
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

        const detailsBtn = popupEl.querySelector('.jobDetailsBtn')
        if (detailsBtn) {
          detailsBtn.addEventListener('click', () => applyForJob(offer))
        }
      })

      const marker = new Marker()
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {

    const map = new Map({
      container: mapContainer.current,

      style: {
        version: 8,

        sources: {
          ign: {
            type: 'raster',
            tiles: [
              'https://data.geopf.fr/wmts?' +
              'SERVICE=WMTS&' +
              'VERSION=1.0.0&' +
              'REQUEST=GetTile&' +
              'LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&' +
              'STYLE=normal&' +
              'FORMAT=image/png&' +
              'TILEMATRIXSET=PM_0_19&' +
              'TILEMATRIX={z}&' +
              'TILEROW={y}&' +
              'TILECOL={x}'
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

    map.on('moveend', renderMarkersInView)
    map.on('load', renderMarkersInView)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          if (hasSearchedRef.current) return

          const userCoordinates = [geoPosition.coords.longitude, geoPosition.coords.latitude]
          setCoordinates(userCoordinates)
          map.setCenter(userCoordinates)
        },
        (error) => {
          console.warn('Géolocalisation indisponible, position par défaut conservée :', error.message)
        }
      )
    }

    const fetchJobOffers = async () => {
      try {
        const response = await fetch('http://localhost:4242/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        setJobOffers(data)
      } catch (error) {
        console.error('Erreur lors de la récupération des offres d\'emploi :', error)
      }
    }

    fetchJobOffers()

    return () => {
      map.off('moveend', renderMarkersInView)
      map.off('load', renderMarkersInView)
      clearMarkers()
      map.remove()
    }

  }, [])

  const searchLocation = async (e) => {
    e.preventDefault()

    if (!position.trim()) return

    setSearchError("")

    const response = await fetch(
      `http://localhost:4242/jobs/geocode?address=${encodeURIComponent(position)}`
    )

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      setSearchError("Localisation introuvable. Vérifiez l'orthographe et réessayez.")
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

    if (mapRef.current) {
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
      if (mapRef.current) {
        renderMarkersInView()
      }
    })

    return () => {
      cancelled = true
    }
  }, [jobOffers])

  return (
    <div className="MapPage">
      <NavBar />
      <form className="searchBar" onSubmit={searchLocation}>
        <label htmlFor="location-search" className="visuallyHidden">
          Rechercher une adresse ou une ville
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
    </div>
  )
}