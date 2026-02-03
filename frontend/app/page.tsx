"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardHome } from "@/lib/api/properties";
import { getCurrentUser } from "@/lib/api/users";
import { Loader2, Home as HomeIcon, CheckCircle, XCircle, MapPin, Users } from "lucide-react";

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardHome,
  });

  // Buscar role do usuário atual
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const userRole = userData?.data?.role;
  const isAdmin = userRole === "admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.status || !data.data) {
    return (
      <div className="w-full">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
          <p className="font-semibold mb-2">Erro ao carregar dashboard</p>
          <p className="text-sm">
            {data?.message || "Erro ao buscar dados do dashboard."}
          </p>
        </div>
      </div>
    );
  }

  const dashboard = data.data;

  const stats = [
    {
      title: "Total de Imóveis",
      value: dashboard.total_properties,
      icon: HomeIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Imóveis Ativos",
      value: dashboard.active_properties,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Imóveis Inativos",
      value: dashboard.inactive_properties,
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Bairros Cadastrados",
      value: dashboard.total_neighborhoods,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    // Card de usuários apenas para administradores
    ...(isAdmin
      ? [
          {
            title: "Usuários Ativos",
            value: dashboard.total_users,
            icon: Users,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            borderColor: "border-indigo-200",
          },
        ]
      : []),
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`bg-card border ${stat.borderColor} rounded-lg p-6 space-y-3 ${stat.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold ${stat.color} mt-1`}>
                  {stat.value.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
