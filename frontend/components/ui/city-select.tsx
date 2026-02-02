"use client";

import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCities, type City, type State } from "@/lib/api/cities";
import { cn } from "@/lib/utils";
import { Loader2, ChevronDown } from "lucide-react";

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  stateId?: string;
  initialCity?: { id: string; name: string; state?: { uf: string } | State } | null;
}

const ITEMS_PER_PAGE = 50;

// Função auxiliar para converter initialCity em City
function createCityFromInitial(initialCity: { id: string; name: string; state?: { uf: string } | State }): City {
  const state: State = 
    initialCity.state && "id" in initialCity.state && "name" in initialCity.state
      ? initialCity.state as State
      : { id: "", name: "", uf: initialCity.state?.uf || "" };
  
  return {
    id: initialCity.id,
    name: initialCity.name,
    created_at: "",
    state,
  };
}

export function CitySelect({ value, onChange, id, disabled, stateId, initialCity }: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCityData, setSelectedCityData] = useState<City | null>(
    initialCity ? createCityFromInitial(initialCity) : null
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce para pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buscar cidades com infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["cities", debouncedSearch, stateId],
    queryFn: ({ pageParam = 1 }) =>
      getCities({
        page: pageParam,
        itemsPage: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        stateId: stateId || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    // Buscar mesmo sem stateId (busca todas as cidades)
  });

  // Flatten das páginas
  const cities = data?.pages.flatMap((page) => page.data || []) || [];

  // Atualizar cidade selecionada quando initialCity mudar
  useEffect(() => {
    if (initialCity) {
      // Se o value corresponde ao initialCity, ou se o value está vazio mas temos initialCity
      if (initialCity.id === value || (value === "" && initialCity.id)) {
        setSelectedCityData(createCityFromInitial(initialCity));
      }
    } else if (!value) {
      // Se não há initialCity e não há value, limpar
      setSelectedCityData(null);
    }
  }, [initialCity, value]);

  // Atualizar cidade selecionada quando encontrar na lista (só se não tiver initialCity correspondente)
  useEffect(() => {
    if (value) {
      // Só atualizar da lista se não temos initialCity correspondente ou se a cidade da lista é diferente
      const hasInitialCityMatch = initialCity && initialCity.id === value;
      if (!hasInitialCityMatch) {
        const foundCity = cities.find((city) => city.id === value);
        if (foundCity) {
          setSelectedCityData(foundCity);
        }
      }
    } else if (!initialCity) {
      setSelectedCityData(null);
    }
  }, [value, cities, initialCity]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll infinito
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement || !isOpen) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    listElement.addEventListener("scroll", handleScroll);
    return () => listElement.removeEventListener("scroll", handleScroll);
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Usar cidade da lista ou dados salvos
  const selectedCity = cities.find((city) => city.id === value) || selectedCityData;

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {selectedCity
            ? selectedCity.state?.uf
              ? `${selectedCity.name} - ${selectedCity.state.uf}`
              : selectedCity.name
            : "Selecione uma cidade"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full rounded-md border bg-popover shadow-md">
          {/* Campo de busca */}
          <div className="border-b p-2">
            <input
              type="text"
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              autoFocus
            />
          </div>

          {/* Lista de cidades */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto"
            style={{ maxHeight: "240px" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Carregando...
                </span>
              </div>
            ) : cities.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma cidade encontrada
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    !value && "bg-accent text-accent-foreground"
                  )}
                >
                  Selecione uma cidade
                </button>
                {cities.map((city: City) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      onChange(city.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                      value === city.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    {city.name} - {city.state.uf}
                  </button>
                ))}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-xs text-muted-foreground">
                      Carregando mais...
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
