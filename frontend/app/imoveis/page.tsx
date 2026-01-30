"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  getProperties,
  type PropertyNegotiation,
  type Property,
} from "@/lib/api/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CitySelect } from "@/components/ui/city-select";
import { NeighborhoodSelect } from "@/components/ui/neighborhood-select";
import { Plus, Loader2, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getNeighborhoods, type Neighborhood } from "@/lib/api/neighborhoods";

export default function PropertiesPage() {
  const [page, setPage] = useState(1);
  const [itemsPage] = useState(12);
  const [cityId, setCityId] = useState("");
  const [neighborhoodsId, setNeighborhoodsId] = useState<string[]>([]);
  const [sortMostRecent, setSortMostRecent] = useState(true);
  const [negotiations, setNegotiations] = useState<PropertyNegotiation[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Buscar bairros da cidade selecionada para mapear IDs para nomes
  const { data: neighborhoodsData } = useInfiniteQuery({
    queryKey: ["neighborhoods", "", cityId],
    queryFn: ({ pageParam = 1 }) =>
      getNeighborhoods({
        page: pageParam,
        itemsPage: 100,
        cityId: cityId || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!cityId && neighborhoodsId.length > 0,
  });

  const allNeighborhoods =
    neighborhoodsData?.pages.flatMap((page) => page.data || []) || [];
  const neighborhoodMap = new Map(
    allNeighborhoods.map((n) => [n.id, n.name])
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "properties",
      page,
      itemsPage,
      cityId,
      neighborhoodsId,
      sortMostRecent,
      negotiations,
    ],
    queryFn: () =>
      getProperties({
        page,
        itemsPage,
        cityId: cityId || undefined,
        neighborhoodsId: neighborhoodsId.length > 0 ? neighborhoodsId : undefined,
        sortMostRecent,
        negotiations: negotiations.length > 0 ? negotiations : undefined,
      }),
  });

  const handleNegotiationToggle = (negotiation: PropertyNegotiation) => {
    setNegotiations((prev) =>
      prev.includes(negotiation)
        ? prev.filter((n) => n !== negotiation)
        : [...prev, negotiation]
    );
    setPage(1); // Resetar para primeira página ao filtrar
  };

  const handleNeighborhoodToggle = (neighborhoodId: string) => {
    setNeighborhoodsId((prev) =>
      prev.includes(neighborhoodId)
        ? prev.filter((id) => id !== neighborhoodId)
        : [...prev, neighborhoodId]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setCityId("");
    setNeighborhoodsId([]);
    setSortMostRecent(true);
    setNegotiations([]);
    setPage(1);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const hasActiveFilters =
    cityId ||
    neighborhoodsId.length > 0 ||
    negotiations.length > 0 ||
    !sortMostRecent;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Imóveis</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus imóveis cadastrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 bg-[#FFCC00] text-black rounded-full px-2 py-0.5 text-xs font-semibold">
                {[
                  cityId && 1,
                  neighborhoodsId.length,
                  negotiations.length,
                  !sortMostRecent && 1,
                ]
                  .filter(Boolean)
                  .reduce((a, b) => (a || 0) + (b || 0), 0)}
              </span>
            )}
          </Button>
          <Link href="/imoveis/novo">
            <Button className="bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black border-black">
              <Plus className="h-4 w-4 mr-2" />
              Novo Imóvel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-city">Cidade</Label>
              <CitySelect
                id="filter-city"
                value={cityId}
                onChange={(value) => {
                  setCityId(value);
                  setNeighborhoodsId([]);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-neighborhood">Bairro</Label>
              <NeighborhoodSelect
                id="filter-neighborhood"
                value=""
                onChange={(value) => {
                  if (value && !neighborhoodsId.includes(value)) {
                    handleNeighborhoodToggle(value);
                  }
                }}
                cityId={cityId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-sort">Ordenar por</Label>
              <Select
                id="filter-sort"
                value={sortMostRecent ? "recent" : "oldest"}
                onChange={(e) => {
                  setSortMostRecent(e.target.value === "recent");
                  setPage(1);
                }}
              >
                <option value="recent">Mais Recentes</option>
                <option value="oldest">Mais Antigos</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Negociações</Label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={negotiations.includes("sale")}
                    onChange={() => handleNegotiationToggle("sale")}
                  />
                  <span className="text-sm">Venda</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={negotiations.includes("lease")}
                    onChange={() => handleNegotiationToggle("lease")}
                  />
                  <span className="text-sm">Aluguel</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bairros selecionados */}
          {neighborhoodsId.length > 0 && (
            <div className="space-y-2">
              <Label>Bairros Selecionados</Label>
              <div className="flex flex-wrap gap-2">
                {neighborhoodsId.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                  >
                    <span>{neighborhoodMap.get(id) || `Bairro ${id.slice(0, 8)}...`}</span>
                    <button
                      type="button"
                      onClick={() => handleNeighborhoodToggle(id)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de imóveis */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Erro ao carregar imóveis. Tente novamente.
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum imóvel encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((property: Property) => (
              <Link
                key={property.id}
                href={`/imoveis/${property.id}`}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-muted">
                  {property.main_image?.url && 
                   property.main_image.url.startsWith('http') &&
                   property.main_image.url.includes('supabase.co') ? (
                    <Image
                      src={property.main_image.url}
                      alt={property.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {property.neighborhood.name}, {property.city.name} - {property.state.uf}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {property.negotiations.includes("sale") && property.sale_value && (
                      <span className="text-sm font-semibold text-[#FFCC00]">
                        Venda: {formatCurrency(property.sale_value)}
                      </span>
                    )}
                    {property.negotiations.includes("lease") && property.lease_value && (
                      <span className="text-sm font-semibold text-[#FFCC00]">
                        Aluguel: {formatCurrency(property.lease_value)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginação */}
          {data.pagination && data.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * itemsPage) + 1} a{" "}
                {Math.min(page * itemsPage, data.pagination.total_items)} de{" "}
                {data.pagination.total_items} imóveis
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: data.pagination.total_pages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === data.pagination!.total_pages ||
                        (p >= page - 1 && p <= page + 1)
                    )
                    .map((p, idx, arr) => (
                      <div key={p} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={page === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={page === p ? "bg-[#FFCC00] text-black" : ""}
                        >
                          {p}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(data.pagination!.total_pages, p + 1))
                  }
                  disabled={page === data.pagination!.total_pages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
