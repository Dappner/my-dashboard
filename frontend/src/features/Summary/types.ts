export interface FlightArc {
  dep_lat: number;
  dep_lng: number;
  arr_lat: number;
  arr_lng: number;
  date: string; // Flight date in YYYY-MM-DD format
  name: string; // Flight name for display
}

export interface City {
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
}
