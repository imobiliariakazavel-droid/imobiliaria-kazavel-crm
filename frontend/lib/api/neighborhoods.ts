import { createClient } from "@/lib/supabase-client";

export interface City {
  id: string;
  name: string;
}

export interface Neighborhood {
  id: string;
  created_at: string;
  name: string;
  city: City;
}

export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface GetNeighborhoodsResponse {
  status: boolean;
  message: string;
  data: Neighborhood[] | null;
  pagination?: Pagination;
}

export interface GetNeighborhoodsParams {
  page: number;
  itemsPage: number;
  search?: string;
  cityId?: string;
}

export async function getNeighborhoods(
  params: GetNeighborhoodsParams
): Promise<GetNeighborhoodsResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_neighborhoods", {
    p_page: params.page,
    p_items_page: params.itemsPage,
    p_search: params.search || null,
    p_city_id: params.cityId || null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar bairros",
      data: null,
    };
  }

  return data as GetNeighborhoodsResponse;
}

export interface CreateNeighborhoodParams {
  name: string;
  cityId: string;
}

export interface CreateNeighborhoodResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    city_id: string;
    created_at: string;
    is_deleted: boolean;
  } | null;
}

export async function createNeighborhood(
  params: CreateNeighborhoodParams
): Promise<CreateNeighborhoodResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("post_neighborhoods", {
    p_name: params.name,
    p_city_id: params.cityId,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao criar bairro",
      data: null,
    };
  }

  return data as CreateNeighborhoodResponse;
}
