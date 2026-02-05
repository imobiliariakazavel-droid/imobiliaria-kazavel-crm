import { createClient } from "@/lib/supabase-client";

// Tipos baseados na função RPC
export type PropertyType = "house" | "apartment" | "land" | "office" | "store" | "farm" | "small_farm";
export type PropertyNegotiation = "sale" | "lease";
export type PropertyStatus = "active" | "inactive";
export type AddressVisibility = "state" | "state_city" | "up_to_neighborhood" | "up_to_street" | "full_address";
export type VisibilityValue = "sale" | "lease" | "condominium" | "iptu" | "fire_insurance";
export type PropertyAmenity = 
  | "air_conditioning" 
  | "elevator" 
  | "pool" 
  | "grill"
  | "kitchen"
  | "balcony"
  | "laundry_room"
  | "home_office"
  | "internet"
  | "interfone"
  | "doorman"
  | "gourmet_area"
  | "terrace"
  | "closet"
  | "built_in_furniture";

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
  isFeatured?: boolean;
}

export interface CreatePropertyResponse {
  status: boolean;
  message: string;
  data: any | null;
}

export interface UpdatePropertyParams {
  id: string;
  type?: PropertyType;
  code?: string;
  negotiations?: PropertyNegotiation[];
  cep?: string;
  street?: string;
  stateId?: string;
  cityId?: string;
  neighborhoodId?: string;
  addressNumber?: number;
  addressComplement?: string;
  addressReference?: string;
  saleValue?: number;
  leaseValue?: number;
  condominiumValue?: number;
  iptuValue?: number;
  valueFireInsurance?: number;
  financing?: boolean;
  addressVisibility?: AddressVisibility;
  visibilityValues?: VisibilityValue[];
  amenities?: PropertyAmenity[];
  numberBedrooms?: number;
  numberSuites?: number;
  numberBathrooms?: number;
  numberParkingSpaces?: number;
  numberRooms?: number;
  totalArea?: number;
  privateArea?: number;
  usefulArea?: number;
  title?: string;
  description?: string;
  status?: PropertyStatus;
  videos?: string[];
  images?: string[];
  isFeatured?: boolean;
}

export interface UpdatePropertyResponse {
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
  code: string;
  title: string;
  status: PropertyStatus;
  negotiations: PropertyNegotiation[];
  sale_value: number | null;
  lease_value: number | null;
  is_featured: boolean;
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
  status?: PropertyStatus[];
  code?: string;
  onlyFeatured?: boolean;
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
    p_is_featured: params.isFeatured || false,
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
    p_status: params.status && params.status.length > 0
      ? params.status
      : null,
    p_code: params.code && params.code.trim() ? params.code.trim() : null,
    p_only_featured: params.onlyFeatured || false,
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
  is_featured: boolean;
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

export async function updateProperty(
  params: UpdatePropertyParams
): Promise<UpdatePropertyResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("patch_properties", {
    p_id: params.id,
    p_type: params.type || null,
    p_code: params.code || null,
    p_negotiations: params.negotiations || null,
    p_cep: params.cep || null,
    p_street: params.street || null,
    p_state_id: params.stateId || null,
    p_city_id: params.cityId || null,
    p_neighborhood_id: params.neighborhoodId || null,
    p_address_number: params.addressNumber !== undefined ? params.addressNumber : null,
    p_address_complement: params.addressComplement || null,
    p_address_reference: params.addressReference || null,
    p_sale_value: params.saleValue !== undefined ? params.saleValue : null,
    p_lease_value: params.leaseValue !== undefined ? params.leaseValue : null,
    p_condominium_value: params.condominiumValue !== undefined ? params.condominiumValue : null,
    p_iptu_value: params.iptuValue !== undefined ? params.iptuValue : null,
    p_value_fire_insurance: params.valueFireInsurance !== undefined ? params.valueFireInsurance : null,
    p_financing: params.financing !== undefined ? params.financing : null,
    p_address_visibility: params.addressVisibility || null,
    p_visibility_values: params.visibilityValues || null,
    p_amenities: params.amenities || null,
    p_number_bedrooms: params.numberBedrooms !== undefined ? params.numberBedrooms : null,
    p_number_suites: params.numberSuites !== undefined ? params.numberSuites : null,
    p_number_bathrooms: params.numberBathrooms !== undefined ? params.numberBathrooms : null,
    p_number_parking_spaces: params.numberParkingSpaces !== undefined ? params.numberParkingSpaces : null,
    p_number_rooms: params.numberRooms !== undefined ? params.numberRooms : null,
    p_total_area: params.totalArea !== undefined ? params.totalArea : null,
    p_private_area: params.privateArea !== undefined ? params.privateArea : null,
    p_useful_area: params.usefulArea !== undefined ? params.usefulArea : null,
    p_title: params.title || null,
    p_description: params.description || null,
    p_status: params.status || null,
    p_videos: params.videos || null,
    p_images: params.images || null,
    p_is_featured: params.isFeatured !== undefined ? params.isFeatured : null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao atualizar imóvel",
      data: null,
    };
  }

  return data as UpdatePropertyResponse;
}

export interface DeletePropertyResponse {
  status: boolean;
  message: string;
  data: null;
}

export async function deleteProperty(
  id: string
): Promise<DeletePropertyResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("delete_properties", {
    p_id: id,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao excluir imóvel",
      data: null,
    };
  }

  return data as DeletePropertyResponse;
}

// Tipos para dashboard
export interface DashboardData {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  total_neighborhoods: number;
  total_users: number;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardData | null;
}

export async function getDashboardHome(): Promise<DashboardResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_dashboard_home");

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar dados do dashboard",
      data: null,
    };
  }

  return data as DashboardResponse;
}
