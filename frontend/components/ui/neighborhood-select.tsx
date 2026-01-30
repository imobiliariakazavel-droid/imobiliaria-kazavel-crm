"use client";

import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getNeighborhoods, type Neighborhood } from "@/lib/api/neighborhoods";
import { cn } from "@/lib/utils";
import { Loader2, ChevronDown } from "lucide-react";

interface NeighborhoodSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  cityId?: string;
}

const ITEMS_PER_PAGE = 50;

export function NeighborhoodSelect({
  value,
  onChange,
  id,
  disabled,
  cityId,
}: NeighborhoodSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce para pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buscar bairros com infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["neighborhoods", debouncedSearch, cityId],
    queryFn: ({ pageParam = 1 }) =>
      getNeighborhoods({
        page: pageParam,
        itemsPage: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        cityId: cityId || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!cityId, // Só buscar se tiver cityId
  });

  // Flatten das páginas
  const neighborhoods = data?.pages.flatMap((page) => page.data || []) || [];

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

  const selectedNeighborhood = neighborhoods.find(
    (neighborhood) => neighborhood.id === value
  );

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => !disabled && cityId && setIsOpen(!isOpen)}
        disabled={disabled || !cityId}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {!cityId
            ? "Selecione uma cidade primeiro"
            : selectedNeighborhood
            ? selectedNeighborhood.name
            : "Selecione um bairro"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && cityId && (
        <div className="absolute z-[100] mt-1 w-full rounded-md border bg-popover shadow-md">
          {/* Campo de busca */}
          <div className="border-b p-2">
            <input
              type="text"
              placeholder="Buscar bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              autoFocus
            />
          </div>

          {/* Lista de bairros */}
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
            ) : neighborhoods.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum bairro encontrado
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
                  Selecione um bairro
                </button>
                {neighborhoods.map((neighborhood: Neighborhood) => (
                  <button
                    key={neighborhood.id}
                    type="button"
                    onClick={() => {
                      onChange(neighborhood.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                      value === neighborhood.id &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    {neighborhood.name}
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
