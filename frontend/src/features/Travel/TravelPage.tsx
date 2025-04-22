import Globe from "react-globe.gl";
import { PageContainer } from "@/components/layout/components/PageContainer";
import { useEffect, useState, useRef } from "react";

interface FlightArc {
  dep_lat: number;
  dep_lng: number;
  arr_lat: number;
  arr_lng: number;
  date: string; // Flight date in YYYY-MM-DD format
  name: string; // Flight name for display
}

interface City {
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
}

export default function TravelPage() {
  const [flights, setFlights] = useState<FlightArc[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date("2025-01-01"));
  const [activeFlights, setActiveFlights] = useState<FlightArc[]>([]);
  const [currentFlight, setCurrentFlight] = useState<FlightArc | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1); // 1 = normal speed, 2 = double speed, etc.
  const globeEl = useRef<any>(null);

  useEffect(() => {
    // Major cities data
    const cityData: City[] = [
      {
        name: "New York",
        lat: 40.7128,
        lng: -74.006,
        size: 0.5,
        color: "#ff6b6b",
      },
      {
        name: "London",
        lat: 51.5074,
        lng: -0.1278,
        size: 0.5,
        color: "#4ecdc4",
      },
      {
        name: "Tokyo",
        lat: 35.6762,
        lng: 139.6503,
        size: 0.5,
        color: "#45b7d1",
      },
      { name: "Paris", lat: 48.8566, lng: 2.3522, size: 0.5, color: "#f7b731" },
      {
        name: "Sydney",
        lat: -33.8688,
        lng: 151.2093,
        size: 0.5,
        color: "#5f27cd",
      },
      {
        name: "Dubai",
        lat: 25.2048,
        lng: 55.2708,
        size: 0.5,
        color: "#ff9ff3",
      },
      {
        name: "Singapore",
        lat: 1.3521,
        lng: 103.8198,
        size: 0.5,
        color: "#54a0ff",
      },
      {
        name: "São Paulo",
        lat: -23.5505,
        lng: -46.6333,
        size: 0.5,
        color: "#ff6b6b",
      },
      {
        name: "Cairo",
        lat: 30.0444,
        lng: 31.2357,
        size: 0.5,
        color: "#feca57",
      },
      {
        name: "Moscow",
        lat: 55.7558,
        lng: 37.6173,
        size: 0.5,
        color: "#ff9f43",
      },
    ];

    setCities(cityData);

    // Flight paths with dates
    const flightData: FlightArc[] = [
      {
        dep_lat: 40.7128, // New York
        dep_lng: -74.006,
        arr_lat: 51.5074, // London
        arr_lng: -0.1278,
        date: "2025-01-15",
        name: "New York to London",
      },
      {
        dep_lat: 51.5074, // London
        dep_lng: -0.1278,
        arr_lat: 35.6762, // Tokyo
        arr_lng: 139.6503,
        date: "2025-02-20",
        name: "London to Tokyo",
      },
      {
        dep_lat: 35.6762, // Tokyo
        dep_lng: 139.6503,
        arr_lat: -33.8688, // Sydney
        arr_lng: 151.2093,
        date: "2025-04-10",
        name: "Tokyo to Sydney",
      },
      {
        dep_lat: 48.8566, // Paris
        dep_lng: 2.3522,
        arr_lat: 25.2048, // Dubai
        arr_lng: 55.2708,
        date: "2025-06-05",
        name: "Paris to Dubai",
      },
      {
        dep_lat: 25.2048, // Dubai
        dep_lng: 55.2708,
        arr_lat: 1.3521, // Singapore
        arr_lng: 103.8198,
        date: "2025-08-15",
        name: "Dubai to Singapore",
      },
      {
        dep_lat: 1.3521, // Singapore
        dep_lng: 103.8198,
        arr_lat: 40.7128, // New York
        arr_lng: -74.006,
        date: "2025-10-01",
        name: "Singapore to New York",
      },
    ];

    setFlights(flightData);

    // Initial globe angle
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
    }
  }, []);

  // Timeline progression
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentDate((prevDate) => {
          const nextDate = new Date(prevDate);
          nextDate.setDate(nextDate.getDate() + timeSpeed);
          return nextDate;
        });
      }
    }, 100); // Check every 100ms

    return () => clearInterval(timer);
  }, [isPaused, timeSpeed]);

  // Check for flights on the current date
  useEffect(() => {
    const currentDateStr = currentDate.toISOString().split("T")[0];
    const flightOnThisDate = flights.find(
      (flight) => flight.date === currentDateStr,
    );

    if (flightOnThisDate) {
      setIsPaused(true);
      setCurrentFlight(flightOnThisDate);
      setActiveFlights([flightOnThisDate]);

      // Focus globe on the flight path
      if (globeEl.current) {
        const centerLat =
          (flightOnThisDate.dep_lat + flightOnThisDate.arr_lat) / 2;
        const centerLng =
          (flightOnThisDate.dep_lng + flightOnThisDate.arr_lng) / 2;
        globeEl.current.pointOfView(
          { lat: centerLat, lng: centerLng, altitude: 2.0 },
          1000,
        );
      }

      // Resume after 5 seconds and clear the active flight
      setTimeout(() => {
        setIsPaused(false);
        setCurrentFlight(null);
        setActiveFlights([]);
      }, 5000);
    }
  }, [currentDate, flights]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const adjustSpeed = (speed: number) => {
    setTimeSpeed(speed);
  };

  return (
    <PageContainer>
      <div
        style={{
          backgroundColor: "#111111",
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Timeline Header */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
            padding: "20px",
            color: "white",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            2025 Travel Timeline
          </h1>
          <div
            style={{
              fontSize: "24px",
              color: currentFlight ? "#ff4444" : "#ffffff",
              transition: "color 0.3s ease",
            }}
          >
            {formatDate(currentDate)}
          </div>
          {currentFlight && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "18px",
                color: "#ff4444",
                fontWeight: "bold",
              }}
            >
              Flight: {currentFlight.name}
            </div>
          )}

          {/* Control Buttons */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={togglePause}
              style={{
                padding: "8px 16px",
                background: isPaused ? "#ff4444" : "#4ecdc4",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background 0.3s ease",
              }}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              onClick={() => adjustSpeed(0.5)}
              type="button"
              style={{
                padding: "8px 16px",
                background: timeSpeed === 0.5 ? "#4ecdc4" : "#333",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
            >
              0.5x
            </button>
            <button
              onClick={() => adjustSpeed(1)}
              type="button"
              style={{
                padding: "8px 16px",
                background: timeSpeed === 1 ? "#4ecdc4" : "#333",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
            >
              1x
            </button>
            <button
              onClick={() => adjustSpeed(2)}
              style={{
                padding: "8px 16px",
                background: timeSpeed === 2 ? "#4ecdc4" : "#333",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              type="button"
            >
              2x
            </button>
            <button
              onClick={() => adjustSpeed(5)}
              style={{
                padding: "8px 16px",
                background: timeSpeed === 5 ? "#4ecdc4" : "#333",
                border: "none",
                borderRadius: "5px",
                color: "white",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              type="button"
            >
              5x
            </button>
          </div>
        </div>

        {/* Globe Component */}
        <Globe
          ref={globeEl}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
          // backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          // Arcs (flight paths)
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
          // Points (cities)
          pointsData={cities}
          pointLat={(d: object) => (d as City).lat}
          pointLng={(d: object) => (d as City).lng}
          pointColor={(d: object) => (d as City).color}
          pointAltitude={0.01}
          pointRadius={(d: object) => (d as City).size}
          // Labels (city names)
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
          graticuleColor="#222"
          animateIn={true}
        />

        {/* Upcoming Flights Sidebar */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "20px",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.7)",
            padding: "20px",
            borderRadius: "10px",
            color: "white",
            width: "200px",
            fontFamily: "system-ui, sans-serif",
            zIndex: 1000,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "15px" }}>2025 Flights</h3>
          {flights.map((flight, index) => {
            const flightDate = new Date(flight.date);
            const isPast = flightDate < currentDate;
            const isCurrent = flight === currentFlight;

            return (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  opacity: isPast ? 0.5 : 1,
                  color: isCurrent ? "#ff4444" : "#ffffff",
                  fontWeight: isCurrent ? "bold" : "normal",
                  borderLeft: isCurrent ? "3px solid #ff4444" : "none",
                  paddingLeft: isCurrent ? "10px" : "0",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: "14px" }}>{flight.name}</div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  {new Date(flight.date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
