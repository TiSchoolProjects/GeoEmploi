import { useState, useEffect, useRef } from 'react'
import { Map, Marker, Popup, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../CSS/MapPage.css'
import NavBar from "../components/Navbar";

setWorkerUrl(workerUrl)

export default function MapPage() {

  const [coordinates, setCoordinates] = useState([2.3522, 48.8566]) // Paris par défaut
  const [position, setPosition] = useState("")
  const [jobOffers, setJobOffers] = useState([])

  const zoom = 13
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const jobOffersRef = useRef([])
  const hasSearchedRef = useRef(false)

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
  }

  const renderMarkersInView = () => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    const bounds = map.getBounds()

    for (const offer of jobOffersRef.current) {
      if (offer.lat == null || offer.lng == null) {
        continue
      }

      const lngLat = [Number(offer.lng), Number(offer.lat)]

      if (!bounds.contains(lngLat)) {
        continue
      }

      const popupHtml = `
        <div class="jobOfferPopup">
          <h3>${offer.title}</h3>
          <p>${offer.description}</p>
          <p><strong>Entreprise :</strong> ${offer.company}</p>
          <p><strong>Lieu :</strong> ${offer.location}</p>
        </div>
      `

      const popup = new Popup({ offset: 25, closeButton: true }).setHTML(popupHtml)

      const marker = new Marker()
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    }
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

    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(position)}&limit=1` // mettre dans le back
    )

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      alert("Localisation introuvable")
      return
    }

    hasSearchedRef.current = true

    const newCoordinates = data.features[0].geometry.coordinates

    setCoordinates(newCoordinates)

    if (mapRef.current) {
      mapRef.current.setCenter(newCoordinates)
    }

    const score = data.features[0].properties.score
    console.log("Coordonnées :", newCoordinates)
    console.log("Score :", score)
  }

  useEffect(() => {
    jobOffersRef.current = jobOffers
    if (mapRef.current) {
      renderMarkersInView()
      console.log(`Details des offres d'emploi : ${JSON.stringify(jobOffers)}`)
    }
  }, [jobOffers])

  return (
    <div className="MapPage">
      <NavBar />
      <div className="searchBar">
        <input
          type="text"
          placeholder="Search a location"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <button type="submit" onClick={searchLocation}>
          Rechercher
        </button>
      </div>
      <div
        ref={mapContainer}
        className="map"
      />
    </div>
  )
}