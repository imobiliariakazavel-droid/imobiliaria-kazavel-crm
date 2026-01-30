import { createClient } from "@/lib/supabase-client";

export interface State {
  id: string;
  name: string;
  uf: string;
}

export interface City {
  id: string;
  created_at: string;
  name: string;
  state: State;
}

export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface GetCitiesResponse {
  status: boolean;
  message: string;
  data: City[] | null;
  pagination?: Pagination;
}

export interface GetCitiesParams {
  page: number;
  itemsPage: number;
  search?: string;
}

export async function getCities(
  params: GetCitiesParams
): Promise<GetCitiesResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_cities", {
    p_page: params.page,
    p_items_page: params.itemsPage,
    p_search: params.search || null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar cidades",
      data: null,
    };
  }

  return data as GetCitiesResponse;
}
