import { createClient } from "@/lib/supabase-client";

export interface State {
  id: string;
  created_at: string;
  name: string;
  uf: string;
}

export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface GetStatesResponse {
  status: boolean;
  message: string;
  data: State[] | null;
  pagination?: Pagination;
}

export interface GetStatesParams {
  page: number;
  itemsPage: number;
  search?: string;
}

export async function getStates(
  params: GetStatesParams
): Promise<GetStatesResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_states", {
    p_page: params.page,
    p_items_page: params.itemsPage,
    p_search: params.search || null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar estados",
      data: null,
    };
  }

  return data as GetStatesResponse;
}
