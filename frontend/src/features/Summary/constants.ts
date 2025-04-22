import type { City, FlightArc } from "./types";

export const generateMockFlights = (year: number) => {
	const flights: FlightArc[] = [
		{
			dep_lat: 40.7128,
			dep_lng: -74.006, // NYC
			arr_lat: 51.5074,
			arr_lng: -0.1278, // London
			date: `${year}-01-15`,
			name: "NYC to London",
		},
		{
			dep_lat: 51.5074,
			dep_lng: -0.1278, // London
			arr_lat: 48.8566,
			arr_lng: 2.3522, // Paris
			date: `${year}-02-20`,
			name: "London to Paris",
		},
		{
			dep_lat: 48.8566,
			dep_lng: 2.3522, // Paris
			arr_lat: 35.6762,
			arr_lng: 139.6503, // Tokyo
			date: `${year}-03-25`,
			name: "Paris to Tokyo",
		},
		{
			dep_lat: 35.6762,
			dep_lng: 139.6503, // Tokyo
			arr_lat: -33.8688,
			arr_lng: 151.2093, // Sydney
			date: `${year}-05-10`,
			name: "Tokyo to Sydney",
		},
		{
			dep_lat: -33.8688,
			dep_lng: 151.2093, // Sydney
			arr_lat: 34.0522,
			arr_lng: -118.2437, // LA
			date: `${year}-07-15`,
			name: "Sydney to LA",
		},
		{
			dep_lat: 34.0522,
			dep_lng: -118.2437, // LA
			arr_lat: 40.7128,
			arr_lng: -74.006, // NYC
			date: `${year}-08-20`,
			name: "LA to NYC",
		},
		{
			dep_lat: 40.7128,
			dep_lng: -74.006, // NYC
			arr_lat: 41.9028,
			arr_lng: 12.4964, // Rome
			date: `${year}-10-10`,
			name: "NYC to Rome",
		},
		{
			dep_lat: 41.9028,
			dep_lng: 12.4964, // Rome
			arr_lat: 40.7128,
			arr_lng: -74.006, // NYC
			date: `${year}-11-20`,
			name: "Rome to NYC",
		},
	];
	return flights;
};

// Major cities
export const cities: City[] = [
	{ name: "New York", lat: 40.7128, lng: -74.006, size: 0.8, color: "#ff4444" },
	{ name: "London", lat: 51.5074, lng: -0.1278, size: 0.7, color: "#4444ff" },
	{ name: "Paris", lat: 48.8566, lng: 2.3522, size: 0.7, color: "#44ff44" },
	{ name: "Tokyo", lat: 35.6762, lng: 139.6503, size: 0.8, color: "#ffaa44" },
	{ name: "Sydney", lat: -33.8688, lng: 151.2093, size: 0.6, color: "#44ffff" },
	{
		name: "Los Angeles",
		lat: 34.0522,
		lng: -118.2437,
		size: 0.7,
		color: "#ff44ff",
	},
	{ name: "Rome", lat: 41.9028, lng: 12.4964, size: 0.6, color: "#aaff44" },
];
