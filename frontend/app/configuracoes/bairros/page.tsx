"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/ui/city-select";
import { getNeighborhoods, type Neighborhood } from "@/lib/api/neighborhoods";
import { CreateNeighborhoodDialog } from "./components/CreateNeighborhoodDialog";
import { EditNeighborhoodDialog } from "./components/EditNeighborhoodDialog";
import { DeleteNeighborhoodDialog } from "./components/DeleteNeighborhoodDialog";

const ITEMS_PER_PAGE = 20;

export default function BairrosPage() {
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [searchCityId, setSearchCityId] = useState<string>("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(null);

  // Debounce para pesquisa por nome
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchName(searchName);
      setPage(1); // Reset para primeira página ao pesquisar
    }, 500);

    return () => clearTimeout(timer);
  }, [searchName]);

  // Buscar bairros
  const {
    data: neighborhoodsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "neighborhoods",
      {
        page,
        itemsPage: ITEMS_PER_PAGE,
        search: debouncedSearchName || undefined,
        cityId: searchCityId || undefined,
      },
    ],
    queryFn: () =>
      getNeighborhoods({
        page,
        itemsPage: ITEMS_PER_PAGE,
        search: debouncedSearchName || undefined,
        cityId: searchCityId || undefined,
      }),
  });

  const neighborhoods = neighborhoodsData?.data || [];
  const pagination = neighborhoodsData?.pagination;

  const handleCityChange = (cityId: string) => {
    setSearchCityId(cityId);
    setPage(1); // Reset para primeira página ao filtrar
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchCityId("");
    setPage(1);
  };

  const handleEditNeighborhood = (neighborhood: Neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setIsEditDialogOpen(true);
  };

  const handleDeleteNeighborhood = (neighborhood: Neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/configuracoes">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Configurações
            </Button>
          </Link>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black border-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Bairro
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Bairros
        </h1>
        <p className="text-muted-foreground">
          Gerencie os bairros cadastrados no sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Pesquisar por nome</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-name"
                placeholder="Digite o nome do bairro..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-city">Filtrar por cidade</Label>
            <CitySelect
              id="search-city"
              value={searchCityId}
              onChange={handleCityChange}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de bairros */}
      <div className="bg-card border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando bairros...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-destructive">
              Erro ao carregar bairros. Tente novamente.
            </p>
          </div>
        ) : neighborhoods.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum bairro encontrado com os filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Cidade
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {neighborhoods.map((neighborhood: Neighborhood) => (
                    <tr
                      key={neighborhood.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {neighborhood.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {neighborhood.city.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNeighborhood(neighborhood)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar bairro</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNeighborhood(neighborhood)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir bairro</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination && pagination.total_pages > 1 && (
              <div className="border-t px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {neighborhoods.length} de {pagination.total_items}{" "}
                  bairros
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {pagination.current_page} de{" "}
                    {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(pagination.total_pages, p + 1)
                      )
                    }
                    disabled={page === pagination.total_pages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog de criação */}
      <CreateNeighborhoodDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Dialog de edição */}
      <EditNeighborhoodDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        neighborhood={selectedNeighborhood}
      />

      {/* Dialog de exclusão */}
      <DeleteNeighborhoodDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        neighborhood={selectedNeighborhood}
      />
    </div>
  );
}
