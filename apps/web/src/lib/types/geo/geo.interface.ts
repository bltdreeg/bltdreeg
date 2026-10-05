// المحافظة/المدينة/المنطقة زي ما بترجع من Laravel /geo
export type LocationSource = "gps" | "ip" | "manual" | "maps_url" | "default";

export interface GeoDivision {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface NamedRef {
  id: string;
  name: string;
}

export interface ResolvedLocation {
  governorate: NamedRef;
  city: NamedRef;
  area: NamedRef;
  lat: number;
  lng: number;
  source: LocationSource;
}

export interface ConfirmLocationDto {
  areaId: string;
  lat?: number;
  lng?: number;
  source?: "gps" | "ip" | "manual";
}
