import Globe from "react-globe.gl";
import { useEffect, useRef } from "react";

interface FlightArc {
  dep_lat: number;
  dep_lng: number;
  arr_lat: number;
  arr_lng: number;
  date: string;
  name: string;
}

interface City {
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
}

interface TravelGlobeProps {
  activeFlights: FlightArc[];
  cities: City[];
  currentFlight: FlightArc | null;
  onGlobeReady?: (globeEl: any) => void;
}

export const TravelGlobe: React.FC<TravelGlobeProps> = ({
  activeFlights,
  cities,
  currentFlight,
  onGlobeReady,
}) => {
  const globeEl = useRef<any>(null);

  useEffect(() => {
    if (globeEl.current) {
      // Initial globe view
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);

      if (onGlobeReady) {
        onGlobeReady(globeEl.current);
      }
    }
  }, [onGlobeReady]);

  useEffect(() => {
    if (currentFlight && globeEl.current) {
      // Focus on current flight path
      const centerLat = (currentFlight.dep_lat + currentFlight.arr_lat) / 2;
      const centerLng = (currentFlight.dep_lng + currentFlight.arr_lng) / 2;
      globeEl.current.pointOfView(
        { lat: centerLat, lng: centerLng, altitude: 2.0 },
        1000,
      );
    }
  }, [currentFlight]);

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      // Flight paths
      arcsData={activeFlights}
      arcStartLat={(d: object) => (d as FlightArc).dep_lat}
      arcStartLng={(d: object) => (d as FlightArc).dep_lng}
      arcEndLat={(d: object) => (d as FlightArc).arr_lat}
      arcEndLng={(d: object) => (d as FlightArc).arr_lng}
      arcColor={() => ["#ff0000", "#ff8800"]}
      arcDashLength={0.6}
      arcDashGap={0.3}
      arcDashAnimateTime={1200}
      arcStroke={1.5}
      arcAltitudeAutoScale={0.3}
      arcsTransitionDuration={1000}
      // Cities
      pointsData={cities}
      pointLat={(d: object) => (d as City).lat}
      pointLng={(d: object) => (d as City).lng}
      pointColor={(d: object) => (d as City).color}
      pointAltitude={0.01}
      pointRadius={(d: object) => (d as City).size}
      // City labels
      labelsData={cities}
      labelLat={(d: object) => (d as City).lat}
      labelLng={(d: object) => (d as City).lng}
      labelText={(d: object) => (d as City).name}
      labelSize={0.7}
      labelDotRadius={0.3}
      labelColor={() => "#ffffff"}
      labelResolution={2}
      labelAltitude={0.01}
      // Globe settings
      enablePointerInteraction={true}
      showAtmosphere={true}
      atmosphereColor="#3a3a3a"
      atmosphereAltitude={0.25}
      showGraticules={true}
      // graticuleColor="#222"
      animateIn={true}
    />
  );
};

export default TravelGlobe;
