import { useState, useEffect, useRef } from 'react'
import { Map, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../CSS/MapPage.css'
import NavBar from "../components/Navbar";

setWorkerUrl(workerUrl)

export default function MapPage() {

  const [coordinates, setCoordinates] = useState([2.3522, 48.8566])
  const [position, setPosition] = useState("")
  const [jobOffers, setJobOffers] = useState([])
  
  const zoom = 13
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

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

    // fetch job offers from the backend
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
    
    return () => map.remove()
    
  }, [])
  
  const getMarkers = () => {
    if (!mapRef.current) return
    
  for (const offer of jobOffers) {
    if (offer.lat == null || offer.lng == null) {
      console.log(`Coordonnées manquantes pour ${offer.title}`)
      continue
    }

    new Marker()
      .setLngLat([
        Number(offer.lng),
        Number(offer.lat)
      ])
      .addTo(mapRef.current)
  }
}

  const searchLocation = async (e) => {
    e.preventDefault()

    if (!position.trim()) return

    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(position)}&limit=1` // mettre dans le back
    )

    const data = await response.json()

    if (data.length === 0) {
      alert("Localisation introuvable")
      return
    }

    const newCoordinates = data.features[0].geometry.coordinates

    setCoordinates(newCoordinates)

    if (mapRef.current) {
      mapRef.current.setCenter(newCoordinates)
    }

    const score = data.features[0].propreties.score
    console.log("Coordonnées :", coordinates)
    console.log("Score :", score)
  }

  useEffect(() => {
    if (mapRef.current && jobOffers.length > 0) {
      getMarkers()
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
      <div className="mapJobContainer">
        <div
          ref={mapContainer}
          className="map"
        />
        <div className="jobOffers">
          <h2>Offres d'emploi</h2>
          {jobOffers.length === 0 ? (
            <p>Aucune offre d'emploi disponible.</p>
          ) : (
            jobOffers.map((offer) => (
              <div key={offer.id} className="jobOfferCard">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <p><strong>Entreprise :</strong> {offer.company}</p>
                <p><strong>Lieu :</strong> {offer.location}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}