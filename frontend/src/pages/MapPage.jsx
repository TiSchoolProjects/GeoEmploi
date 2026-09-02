import { useState, useEffect, useRef } from 'react'
import { Map, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../CSS/MapPage.css'
import NavBar from "../components/Navbar";

setWorkerUrl(workerUrl)

export default function MapPage() {

  const [coordinates, setCoordinates] = useState([48.8566, 2.3522])
  const [position, setPosition] = useState("")
  const [jobOffers, setJobOffers] = useState([])
  
  const zoom = 13
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {

    const map = new Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/positron', // mettre dans le back
      center: [coordinates[1], coordinates[0]],
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
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(position)}&limit=1` // mettre dans le back
    )

    const data = await response.json()

    if (data.length === 0) {
      alert("Localisation introuvable")
      return
    }

    const newCoordinates = [
      parseFloat(data[0].lat),
      parseFloat(data[0].lon)
    ]

    setCoordinates(newCoordinates)

    if (mapRef.current) {
      mapRef.current.setCenter([
        newCoordinates[1],
        newCoordinates[0]
      ])
    }

    console.log(`Nouvelle position : ${newCoordinates[0]}, ${newCoordinates[1]}`)
  }

  useEffect(() => {
    if (mapRef.current && jobOffers.length > 0) {
      getMarkers()
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
