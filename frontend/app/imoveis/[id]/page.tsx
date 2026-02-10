"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProperty, deleteProperty } from "@/lib/api/properties";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Check, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const propertyId = params.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => getProperty(propertyId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: (data) => {
      if (data.status) {
        // Invalidar cache de propriedades
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
        // Redirecionar para lista de imóveis
        router.push("/imoveis");
      } else {
        alert(data.message || "Erro ao excluir imóvel");
      }
    },
    onError: (error: Error) => {
      alert(error.message || "Erro ao excluir imóvel");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(propertyId);
    setShowDeleteDialog(false);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const propertyTypeLabels: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    land: "Terreno",
    office: "Escritório",
    store: "Loja",
    farm: "Fazenda",
    small_farm: "Chácara",
    two_story_house: "Sobrado",
    condominium: "Condomínio",
  };

  const addressVisibilityLabels: Record<string, string> = {
    state: "Apenas Estado",
    state_city: "Estado e Cidade",
    up_to_neighborhood: "Até o Bairro",
    up_to_street: "Até a Rua",
    full_address: "Endereço Completo",
  };

  const visibilityValueLabels: Record<string, string> = {
    sale: "Valor de Venda",
    lease: "Valor de Aluguel",
    condominium: "Valor do Condomínio",
    iptu: "Valor do IPTU",
    fire_insurance: "Valor do Seguro Incêndio",
  };

  const amenityLabels: Record<string, string> = {
    air_conditioning: "Ar Condicionado",
    elevator: "Elevador",
    pool: "Piscina",
    grill: "Churrasqueira",
    kitchen: "Cozinha",
    balcony: "Varanda",
    laundry_room: "Área de Serviço",
    home_office: "Escritório",
    internet: "Internet",
    interfone: "Interfone",
    doorman: "Porteiro",
    gourmet_area: "Área Gourmet",
    terrace: "Terraço",
    closet: "Closet",
    built_in_furniture: "Mobília Planejada",
  };

  const statusLabels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.status || !data.data) {
    return (
      <div className="w-full space-y-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
          <p className="font-semibold mb-2">Erro ao carregar imóvel</p>
          <p className="text-sm">
            {data?.message || "Imóvel não encontrado ou erro ao buscar dados."}
          </p>
        </div>
      </div>
    );
  }

  const property = data.data;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Imóvel</h1>
          <p className="text-muted-foreground mt-2">
            Visualize todas as informações do imóvel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Link href={`/imoveis/${propertyId}/editar`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Dados do Imóvel com Imagem Principal */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Imagem Principal */}
            {property.images && property.images.length > 0 && (
              <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                {(() => {
                  const mainImage = property.images.find((img) => img.order === 1) || property.images[0];
                  return mainImage.url &&
                    mainImage.url.startsWith("http") &&
                    mainImage.url.includes("supabase.co") ? (
                    <Image
                      src={mainImage.url}
                      alt={property.title}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Sem imagem
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Dados do Imóvel */}
            <div className={`${property.images && property.images.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">
                Dados do Imóvel
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo do Imóvel</Label>
                  <p className="text-sm text-muted-foreground">
                    {propertyTypeLabels[property.type] || property.type}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Código do Imóvel</Label>
                  <p className="text-sm text-muted-foreground">{property.code}</p>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <p className="text-sm text-muted-foreground">{property.title}</p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {statusLabels[property.status] || property.status}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Em Destaque</Label>
                  <p className="text-sm text-muted-foreground">
                    {property.is_featured ? "Sim" : "Não"}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {property.description || "Não informado"}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Negociações</Label>
                  <div className="flex flex-wrap gap-4">
                    {property.negotiations.includes("sale") && (
                      <span className="px-3 py-1 bg-muted rounded-md text-sm">
                        Venda
                      </span>
                    )}
                    {property.negotiations.includes("lease") && (
                      <span className="px-3 py-1 bg-muted rounded-md text-sm">
                        Aluguel
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Localização</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CEP</Label>
              <p className="text-sm text-muted-foreground">
                {property.cep || "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Rua</Label>
              <p className="text-sm text-muted-foreground">{property.street}</p>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <p className="text-sm text-muted-foreground">
                {property.state.name} - {property.state.uf}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <p className="text-sm text-muted-foreground">
                {property.city.name}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Bairro</Label>
              <p className="text-sm text-muted-foreground">
                {property.neighborhood.name}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Número</Label>
              <p className="text-sm text-muted-foreground">
                {property.address_number || "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Complemento</Label>
              <p className="text-sm text-muted-foreground">
                {property.address_complement || "Não informado"}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Ponto de Referência</Label>
              <p className="text-sm text-muted-foreground">
                {property.address_reference || "Não informado"}
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Valores</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor de Venda (R$)</Label>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(property.sale_value)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Valor de Aluguel (R$)</Label>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(property.lease_value)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Valor do Condomínio (R$)</Label>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(property.condominium_value)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Valor do IPTU (R$)</Label>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(property.iptu_value)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Valor do Seguro Incêndio (R$)</Label>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(property.value_fire_insurance)}
              </p>
            </div>

            <div className="space-y-2 flex items-end">
              <Label>Aceita Financiamento</Label>
              <p className="text-sm text-muted-foreground">
                {property.financing ? "Sim" : "Não"}
              </p>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Características
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quartos</Label>
              <p className="text-sm text-muted-foreground">
                {property.number_bedrooms !== null
                  ? property.number_bedrooms
                  : "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Suítes</Label>
              <p className="text-sm text-muted-foreground">
                {property.number_suites !== null
                  ? property.number_suites
                  : "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Banheiros</Label>
              <p className="text-sm text-muted-foreground">
                {property.number_bathrooms !== null
                  ? property.number_bathrooms
                  : "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Vagas de Garagem</Label>
              <p className="text-sm text-muted-foreground">
                {property.number_parking_spaces !== null
                  ? property.number_parking_spaces
                  : "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Salas</Label>
              <p className="text-sm text-muted-foreground">
                {property.number_rooms !== null
                  ? property.number_rooms
                  : "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Área Total (m²)</Label>
              <p className="text-sm text-muted-foreground">
                {property.total_area}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Área Privativa (m²)</Label>
              <p className="text-sm text-muted-foreground">
                {property.private_area}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Área Útil (m²)</Label>
              <p className="text-sm text-muted-foreground">
                {property.useful_area}
              </p>
            </div>
          </div>
        </section>

        {/* Visibilidade */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Visibilidade</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibilidade do Endereço</Label>
              <p className="text-sm text-muted-foreground">
                {addressVisibilityLabels[property.address_visibility] ||
                  property.address_visibility}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Visibilidade dos Valores</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {property.visibility_values && property.visibility_values.length > 0 ? (
                  property.visibility_values.map((value) => (
                    <span
                      key={value}
                      className="px-3 py-1 bg-muted rounded-md text-sm"
                    >
                      {visibilityValueLabels[value] || value}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum selecionado</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Comodidades */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Comodidades</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.amenities && property.amenities.length > 0 ? (
              property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#FFCC00]" />
                  <span className="text-sm">
                    {amenityLabels[amenity] || amenity}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground md:col-span-4">
                Nenhuma comodidade selecionada
              </p>
            )}
          </div>
        </section>

        {/* Mídia */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Mídia</h2>

          <div className="space-y-6">
            {/* Imagens */}
            <div className="space-y-2">
              <Label>Imagens ({property.images?.length || 0})</Label>
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {property.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                    >
                      {image.url &&
                      image.url.startsWith("http") &&
                      image.url.includes("supabase.co") ? (
                        <Image
                          src={image.url}
                          alt={`Imagem ${image.order}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma imagem cadastrada
                </p>
              )}
            </div>

            {/* Vídeos */}
            <div className="space-y-2">
              <Label>Vídeos ({property.videos?.length || 0})</Label>
              {property.videos && property.videos.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {property.videos.map((video) => (
                    <div
                      key={video.id}
                      className="aspect-video bg-muted rounded-lg overflow-hidden"
                    >
                      {video.url && video.url.includes("youtube.com") ? (
                        <iframe
                          src={video.url
                            .replace("watch?v=", "embed/")
                            .split("&")[0]}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {video.url}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum vídeo cadastrado
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogClose onClose={() => setShowDeleteDialog(false)} />
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o imóvel <strong>{property.title}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
