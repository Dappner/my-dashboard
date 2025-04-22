import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

export interface FlightArc {
	dep_lat: number;
	dep_lng: number;
	arr_lat: number;
	arr_lng: number;
	date: string;
	name: string;
}

export interface City {
	name: string;
	lat: number;
	lng: number;
	size: number;
	color: string;
}

export interface TravelGlobeProps {
	activeFlights: FlightArc[];
	cities: City[];
	currentFlight: FlightArc | null;
	onGlobeReady?: (globeEl: any) => void;
	className?: string;
}

export const TravelGlobe: React.FC<TravelGlobeProps> = ({
	activeFlights,
	cities,
	currentFlight,
	onGlobeReady,
	className,
}) => {
	const globeEl = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Update dimensions on resize
	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				const { width, height } = containerRef.current.getBoundingClientRect();
				setDimensions({ width, height });
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	useEffect(() => {
		if (globeEl.current) {
			globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
			onGlobeReady?.(globeEl.current);
		}
	}, [onGlobeReady]);

	useEffect(() => {
		if (currentFlight && globeEl.current) {
			const centerLat = (currentFlight.dep_lat + currentFlight.arr_lat) / 2;
			const centerLng = (currentFlight.dep_lng + currentFlight.arr_lng) / 2;
			globeEl.current.pointOfView(
				{ lat: centerLat, lng: centerLng, altitude: 2.0 },
				1000,
			);
		}
	}, [currentFlight]);

	return (
		<div
			ref={containerRef}
			className={className ?? "w-full h-full overflow-hidden"}
		>
			<Globe
				ref={globeEl}
				width={dimensions.width}
				height={dimensions.height}
				globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
				bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
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
				arcsTransitionDuration={500}
				pointsData={cities}
				pointLat={(d: object) => (d as City).lat}
				pointLng={(d: object) => (d as City).lng}
				pointColor={(d: object) => (d as City).color}
				pointAltitude={0.01}
				pointRadius={(d: object) => (d as City).size}
				labelsData={cities}
				labelLat={(d: object) => (d as City).lat}
				labelLng={(d: object) => (d as City).lng}
				labelText={(d: object) => (d as City).name}
				labelSize={0.7}
				labelDotRadius={0.3}
				labelColor={() => "#ffffff"}
				labelResolution={2}
				labelAltitude={0.01}
				enablePointerInteraction
				showAtmosphere
				atmosphereColor="#3a3a3a"
				atmosphereAltitude={0.25}
				showGraticules
				animateIn
			/>
		</div>
	);
};
