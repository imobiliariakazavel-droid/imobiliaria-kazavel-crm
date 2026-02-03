import { createClient } from "@/lib/supabase-client";

// Tipos para usuários
export type UserRole = "admin" | "standard";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface CurrentUser {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  email: string;
}

export interface GetCurrentUserResponse {
  status: boolean;
  message: string;
  data: CurrentUser | null;
}

export interface CreateUserParams {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface CreateUserResponse {
  status: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
  } | null;
}

export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface GetUsersParams {
  page?: number;
  itemsPage?: number;
  fullName?: string;
}

export interface GetUsersResponse {
  status: boolean;
  message: string;
  data: User[] | null;
  pagination?: Pagination;
}

export interface UpdateUserParams {
  id: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UpdateUserResponse {
  status: boolean;
  message: string;
  data: User | null;
}

/**
 * Cria um novo usuário através da Edge Function post-user
 */
export async function createUser(
  params: CreateUserParams
): Promise<CreateUserResponse> {
  const supabase = createClient();

  // Obter o token de autenticação do usuário atual
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      status: false,
      message: "Usuário não autenticado",
      data: null,
    };
  }

  // Chamar a Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const response = await fetch(`${supabaseUrl}/functions/v1/post-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      full_name: params.full_name,
      role: params.role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      status: false,
      message: data.message || "Erro ao criar usuário",
      data: null,
    };
  }

  return data as CreateUserResponse;
}

/**
 * Lista usuários do sistema usando a função RPC get_users
 * 
 * @param params - Parâmetros de paginação e filtro
 * @returns Lista paginada de usuários
 */
export async function getUsers(
  params: GetUsersParams = {}
): Promise<GetUsersResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_users", {
    p_page: params.page || 1,
    p_items_page: params.itemsPage || 20,
    p_full_name: params.fullName || null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar usuários",
      data: null,
    };
  }

  return data as GetUsersResponse;
}

/**
 * Atualiza um usuário usando a função RPC patch_user
 * 
 * @param params - Parâmetros de atualização do usuário
 * @returns Dados do usuário atualizado
 */
export async function updateUser(
  params: UpdateUserParams
): Promise<UpdateUserResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("patch_user", {
    p_id: params.id,
    p_full_name: params.full_name || null,
    p_role: params.role || null,
    p_is_active: params.is_active !== undefined ? params.is_active : null,
  });

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao atualizar usuário",
      data: null,
    };
  }

  return data as UpdateUserResponse;
}

/**
 * Busca os dados do usuário autenticado usando a função RPC get_user
 * 
 * @returns Dados do usuário atual
 */
export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_user");

  if (error) {
    return {
      status: false,
      message: error.message || "Erro ao buscar dados do usuário",
      data: null,
    };
  }

  return data as GetCurrentUserResponse;
}
