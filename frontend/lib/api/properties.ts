import { createClient } from "@/lib/supabase-client";

// Tipos baseados na função RPC
export type PropertyType = "house" | "apartment" | "land" | "office" | "store";
export type PropertyNegotiation = "sale" | "lease";
export type PropertyStatus = "active" | "inactive";
export type AddressVisibility = "state" | "state_city" | "up_to_neighborhood" | "up_to_street" | "full_address";
export type VisibilityValue = "sale" | "lease" | "condominium" | "iptu" | "fire_insurance";
export type PropertyAmenity = 
  | "air_conditioning" 
  | "elevator" 
  | "pool" 
  | "grill";

export interface CreatePropertyParams {
  type: PropertyType;
  code: string;
  negotiations: PropertyNegotiation[];
  cep?: string;
  street: string;
  stateId: string;
  cityId: string;
  neighborhoodId: string;
  addressNumber?: number;
  addressComplement?: string;
  addressReference?: string;
  saleValue?: number;
  leaseValue?: number;
  condominiumValue?: number;
  iptuValue?: number;
  valueFireInsurance?: number;
  financing: boolean;
  addressVisibility: AddressVisibility;
  visibilityValues: VisibilityValue[];
  amenities?: PropertyAmenity[];
  numberBedrooms?: number;
  numberSuites?: number;
  numberBathrooms?: number;
  numberParkingSpaces?: number;
  numberRooms?: number;
  totalArea: number;
  privateArea: number;
  usefulArea: number;
  title: string;
  description?: string;
  status?: PropertyStatus;
  videos?: string[];
  images?: string[];
}

export interface CreatePropertyResponse {
  status: boolean;
  message: string;
  data: any | null;
}

// Tipos para listagem de imóveis
export interface PropertyCity {
  id: string;
  name: string;
}

export interface PropertyState {
  id: string;
  name: string;
  uf: string;
}

export interface PropertyNeighborhood {
  id: string;
  name: string;
}

export interface PropertyMainImage {
  id: string;
  url: string;
}

export interface Property {
  id: string;
  title: string;
  negotiations: PropertyNegotiation[];
  sale_value: number | null;
  lease_value: number | null;
  city: PropertyCity;
  state: PropertyState;
  neighborhood: PropertyNeighborhood;
  main_image: PropertyMainImage | null;
}

export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface GetPropertiesResponse {
  status: boolean;
  message: string;
  data: Property[] | null;
  pagination?: Pagination;
}

export interface GetPropertiesParams {
  page?: number;
  itemsPage?: number;
  cityId?: string;
  neighborhoodsId?: string[];
  sortMostRecent?: boolean;
  negotiations?: PropertyNegotiation[];
}

export async function createProperty(
  params: CreatePropertyParams
): Promise<CreatePropertyResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("post_properties", {
    p_type: params.type,
    p_code: params.code,
    p_negotiations: params.negotiations,
    p_cep: params.cep || null,
    p_street: params.street,
    p_state_id: params.stateId,
    p_city_id: params.cityId,
    p_neighborhood_id: params.neighborhoodId,
    p_address_number: params.addressNumber || null,
    p_address_complement: params.addressComplement || null,
    p_address_reference: params.addressReference || null,
    p_sale_value: params.saleValue || null,
    p_lease_value: params.leaseValue || null,
    p_condominium_value: params.condominiumValue || null,
    p_iptu_value: params.iptuValue || null,
    p_value_fire_insurance: params.valueFireInsurance || null,
    p_financing: params.financing,
    p_address_visibility: params.addressVisibility,
    p_visibility_values: params.visibilityValues,
    p_amenities: params.amenities || null,
    p_number_bedrooms: params.numberBedrooms || null,
    p_number_suites: params.numberSuites || null,
    p_number_bathrooms: params.numberBathrooms || null,
    p_number_parking_spaces: params.numberParkingSpaces || null,
    p_number_rooms: params.numberRooms || null,
    p_total_area: params.totalArea,
    p_private_area: params.privateArea,
    p_useful_area: params.usefulArea,
    p_title: params.title,
    p_description: params.description || null,
    p_status: params.status || null,
    p_videos: params.videos || null,
    p_images: params.images || null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao criar imóvel",
      data: null,
    };
  }

  return data as CreatePropertyResponse;
}

export async function getProperties(
  params: GetPropertiesParams
): Promise<GetPropertiesResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_properties", {
    p_page: params.page || 1,
    p_items_page: params.itemsPage || 10,
    p_city_id: params.cityId || null,
    p_neighborhoods_id: params.neighborhoodsId && params.neighborhoodsId.length > 0 
      ? params.neighborhoodsId 
      : null,
    p_sort_most_recent: params.sortMostRecent !== undefined ? params.sortMostRecent : true,
    p_negotiations: params.negotiations && params.negotiations.length > 0
      ? params.negotiations
      : null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar imóveis",
      data: null,
    };
  }

  return data as GetPropertiesResponse;
}

// Tipos para detalhes do imóvel
export interface PropertyImage {
  id: string;
  url: string;
  order: number;
}

export interface PropertyVideo {
  id: string;
  url: string;
  order: number;
}

export interface PropertyDetailState {
  id: string;
  name: string;
  uf: string;
}

export interface PropertyDetailCity {
  id: string;
  name: string;
}

export interface PropertyDetailNeighborhood {
  id: string;
  name: string;
}

export interface PropertyDetail {
  id: string;
  created_at: string;
  type: PropertyType;
  code: string;
  negotiations: PropertyNegotiation[];
  cep: string | null;
  street: string;
  address_number: number | null;
  address_complement: string | null;
  address_reference: string | null;
  sale_value: number | null;
  lease_value: number | null;
  condominium_value: number | null;
  iptu_value: number | null;
  value_fire_insurance: number | null;
  financing: boolean;
  address_visibility: AddressVisibility;
  visibility_values: VisibilityValue[];
  amenities: PropertyAmenity[] | null;
  number_bedrooms: number | null;
  number_suites: number | null;
  number_bathrooms: number | null;
  number_parking_spaces: number | null;
  number_rooms: number | null;
  total_area: number;
  private_area: number;
  useful_area: number;
  title: string;
  description: string | null;
  status: PropertyStatus;
  state: PropertyDetailState;
  city: PropertyDetailCity;
  neighborhood: PropertyDetailNeighborhood;
  created_by_id: string;
  images: PropertyImage[];
  videos: PropertyVideo[];
}

export interface GetPropertyResponse {
  status: boolean;
  message: string;
  data: PropertyDetail | null;
}

export async function getProperty(id: string): Promise<GetPropertyResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_propertie", {
    p_id: id,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar imóvel",
      data: null,
    };
  }

  return data as GetPropertyResponse;
}
