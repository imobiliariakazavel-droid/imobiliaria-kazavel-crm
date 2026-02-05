"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateProperty,
  getProperty,
  type PropertyType,
  type PropertyNegotiation,
  type PropertyStatus,
  type AddressVisibility,
  type VisibilityValue,
  type PropertyAmenity,
} from "@/lib/api/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StateSelect } from "@/components/ui/state-select";
import { CitySelect } from "@/components/ui/city-select";
import { NeighborhoodSelect } from "@/components/ui/neighborhood-select";
import { Loader2, Plus, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage, moveImagesFromTemp } from "@/lib/storage";
import Image from "next/image";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const propertyId = params.id as string;
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do imóvel
  const { data: propertyData, isLoading: isLoadingProperty } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => getProperty(propertyId),
  });

  // Mapeamento de tipos de imóvel para exibição
  const propertyTypeLabels: Record<PropertyType, string> = {
    house: "Casa",
    apartment: "Apartamento",
    land: "Terreno",
    office: "Escritório",
    store: "Loja",
    farm: "Fazenda",
    small_farm: "Chácara",
  };

  // Dados do imóvel
  const [type, setType] = useState<PropertyType>("house");
  const [code, setCode] = useState("");
  const [negotiations, setNegotiations] = useState<PropertyNegotiation[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PropertyStatus>("active");

  // Localização
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressReference, setAddressReference] = useState("");

  // Valores
  const [saleValue, setSaleValue] = useState("");
  const [leaseValue, setLeaseValue] = useState("");
  const [condominiumValue, setCondominiumValue] = useState("");
  const [iptuValue, setIptuValue] = useState("");
  const [valueFireInsurance, setValueFireInsurance] = useState("");
  const [financing, setFinancing] = useState<boolean>(false);

  // Visibilidade
  const [addressVisibility, setAddressVisibility] =
    useState<AddressVisibility>("state");
  const [visibilityValues, setVisibilityValues] = useState<VisibilityValue[]>(
    []
  );

  // Características
  const [numberBedrooms, setNumberBedrooms] = useState("");
  const [numberSuites, setNumberSuites] = useState("");
  const [numberBathrooms, setNumberBathrooms] = useState("");
  const [numberParkingSpaces, setNumberParkingSpaces] = useState("");
  const [numberRooms, setNumberRooms] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [privateArea, setPrivateArea] = useState("");
  const [usefulArea, setUsefulArea] = useState("");

  // Comodidades
  const [amenities, setAmenities] = useState<PropertyAmenity[]>([]);

  // Mídia
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Preencher formulário com dados do imóvel
  useEffect(() => {
    if (propertyData?.status && propertyData.data) {
      const property = propertyData.data;
      setType(property.type);
      setCode(property.code);
      setNegotiations(property.negotiations);
      setTitle(property.title);
      setDescription(property.description || "");
      setStatus(property.status);
      setCep(property.cep || "");
      setStreet(property.street);
      setStateId(property.state.id);
      setCityId(property.city.id);
      setNeighborhoodId(property.neighborhood.id);
      setAddressNumber(property.address_number?.toString() || "");
      setAddressComplement(property.address_complement || "");
      setAddressReference(property.address_reference || "");
      setSaleValue(property.sale_value?.toString() || "");
      setLeaseValue(property.lease_value?.toString() || "");
      setCondominiumValue(property.condominium_value?.toString() || "");
      setIptuValue(property.iptu_value?.toString() || "");
      setValueFireInsurance(property.value_fire_insurance?.toString() || "");
      setFinancing(property.financing);
      setAddressVisibility(property.address_visibility);
      setVisibilityValues(property.visibility_values);
      setAmenities(property.amenities || []);
      setNumberBedrooms(property.number_bedrooms?.toString() || "");
      setNumberSuites(property.number_suites?.toString() || "");
      setNumberBathrooms(property.number_bathrooms?.toString() || "");
      setNumberParkingSpaces(property.number_parking_spaces?.toString() || "");
      setNumberRooms(property.number_rooms?.toString() || "");
      setTotalArea(property.total_area.toString());
      setPrivateArea(property.private_area.toString());
      setUsefulArea(property.useful_area.toString());
      setImages(property.images.map((img) => img.url));
      setVideos(property.videos.map((video) => video.url));
    }
  }, [propertyData]);

  const mutation = useMutation({
    mutationFn: updateProperty,
    onSuccess: async (data) => {
      if (data.status) {
        // Verificar se há imagens em temp/ e movê-las para a pasta do imóvel
        const imagesInTemp = images.filter((url) => url.includes("/temp/"));
        if (imagesInTemp.length > 0) {
          try {
            // Mover imagens de temp/ para a pasta do imóvel
            const movedImageUrls = await moveImagesFromTemp(imagesInTemp, propertyId);
            
            // Atualizar as URLs no array de imagens
            const updatedImages = images.map((url) => {
              const index = imagesInTemp.indexOf(url);
              if (index !== -1) {
                return movedImageUrls[index];
              }
              return url;
            });
            
            // Atualizar o imóvel com as novas URLs
            await updateProperty({
              id: propertyId,
              images: updatedImages,
            });
          } catch (error) {
            console.error("Erro ao mover imagens:", error);
            // Continuar mesmo se houver erro ao mover imagens
          }
        }

        // Invalidar cache do imóvel específico e da lista de imóveis
        queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
        queryClient.invalidateQueries({ queryKey: ["properties"] });
        // Redirecionar para a página de detalhes
        router.push(`/imoveis/${propertyId}`);
      } else {
        setError(data.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message || "Erro ao atualizar imóvel");
    },
  });

  const handleNegotiationToggle = (negotiation: PropertyNegotiation) => {
    setNegotiations((prev) =>
      prev.includes(negotiation)
        ? prev.filter((n) => n !== negotiation)
        : [...prev, negotiation]
    );
  };

  const handleVisibilityValueToggle = (value: VisibilityValue) => {
    setVisibilityValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleAmenityToggle = (amenity: PropertyAmenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map((file) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} não é uma imagem válida`);
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} é muito grande. Máximo: 5MB`);
        }

        return uploadImage(file, propertyId);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload das imagens");
    } finally {
      setUploadingImages(false);
      // Limpar o input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      setVideos((prev) => [...prev, newVideoUrl.trim()]);
      setNewVideoUrl("");
    }
  };

  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!code.trim()) {
      setError("Código do imóvel é obrigatório");
      return;
    }

    if (negotiations.length === 0) {
      setError("Selecione pelo menos uma negociação");
      return;
    }

    if (!street.trim()) {
      setError("Rua é obrigatória");
      return;
    }

    if (!stateId) {
      setError("Estado é obrigatório");
      return;
    }

    if (!cityId) {
      setError("Cidade é obrigatória");
      return;
    }

    if (!neighborhoodId) {
      setError("Bairro é obrigatório");
      return;
    }

    if (!totalArea || parseFloat(totalArea) <= 0) {
      setError("Área total é obrigatória");
      return;
    }

    if (!privateArea || parseFloat(privateArea) <= 0) {
      setError("Área privativa é obrigatória");
      return;
    }

    if (!usefulArea || parseFloat(usefulArea) <= 0) {
      setError("Área útil é obrigatória");
      return;
    }

    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    if (visibilityValues.length === 0) {
      setError("Selecione pelo menos um valor de visibilidade");
      return;
    }

    mutation.mutate({
      id: propertyId,
      type,
      code: code.trim(),
      negotiations,
      cep: cep.trim() || undefined,
      street: street.trim(),
      stateId,
      cityId,
      neighborhoodId,
      addressNumber: addressNumber ? parseInt(addressNumber) : undefined,
      addressComplement: addressComplement.trim() || undefined,
      addressReference: addressReference.trim() || undefined,
      saleValue: saleValue ? parseFloat(saleValue) : undefined,
      leaseValue: leaseValue ? parseFloat(leaseValue) : undefined,
      condominiumValue: condominiumValue
        ? parseFloat(condominiumValue)
        : undefined,
      iptuValue: iptuValue ? parseFloat(iptuValue) : undefined,
      valueFireInsurance: valueFireInsurance
        ? parseFloat(valueFireInsurance)
        : undefined,
      financing,
      addressVisibility,
      visibilityValues,
      amenities: amenities.length > 0 ? amenities : undefined,
      numberBedrooms: numberBedrooms ? parseInt(numberBedrooms) : undefined,
      numberSuites: numberSuites ? parseInt(numberSuites) : undefined,
      numberBathrooms: numberBathrooms ? parseInt(numberBathrooms) : undefined,
      numberParkingSpaces: numberParkingSpaces
        ? parseInt(numberParkingSpaces)
        : undefined,
      numberRooms: numberRooms ? parseInt(numberRooms) : undefined,
      totalArea: parseFloat(totalArea),
      privateArea: parseFloat(privateArea),
      usefulArea: parseFloat(usefulArea),
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      videos: videos.length > 0 ? videos : undefined,
      images: images.length > 0 ? images : undefined,
    });
  };

  if (isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!propertyData?.status || !propertyData.data) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
          <p className="font-semibold mb-2">Erro ao carregar imóvel</p>
          <p className="text-sm">
            {propertyData?.message || "Imóvel não encontrado ou erro ao buscar dados."}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Imóvel</h1>
        <p className="text-muted-foreground mt-2">
          Atualize os dados do imóvel abaixo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados do Imóvel */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Dados do Imóvel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo do Imóvel *</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                disabled={mutation.isPending}
                required
              >
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código do Imóvel *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={mutation.isPending}
                required
                placeholder="Ex: APT-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={mutation.isPending}
                required
                placeholder="Ex: Apartamento 2 quartos com varanda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                disabled={mutation.isPending}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={mutation.isPending}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva o imóvel..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Negociações *</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={negotiations.includes("sale")}
                    onChange={() => handleNegotiationToggle("sale")}
                    disabled={mutation.isPending}
                  />
                  <span>Venda</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={negotiations.includes("lease")}
                    onChange={() => handleNegotiationToggle("lease")}
                    disabled={mutation.isPending}
                  />
                  <span>Aluguel</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Localização</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                disabled={mutation.isPending}
                placeholder="00000-000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={mutation.isPending}
                required
                placeholder="Nome da rua"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <StateSelect
                id="state"
                value={stateId}
                onChange={(value) => {
                  setStateId(value);
                  setCityId("");
                  setNeighborhoodId("");
                }}
                disabled={mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <CitySelect
                id="city"
                value={cityId}
                onChange={(value) => {
                  setCityId(value);
                  setNeighborhoodId("");
                }}
                disabled={mutation.isPending}
                stateId={stateId}
                initialCity={
                  propertyData?.status && propertyData.data
                    ? {
                        id: propertyData.data.city.id,
                        name: propertyData.data.city.name,
                        state: {
                          uf: propertyData.data.state.uf,
                        },
                      }
                    : null
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <NeighborhoodSelect
                id="neighborhood"
                value={neighborhoodId}
                onChange={setNeighborhoodId}
                disabled={mutation.isPending}
                cityId={cityId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressNumber">Número</Label>
              <Input
                id="addressNumber"
                type="number"
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
                disabled={mutation.isPending}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressComplement">Complemento</Label>
              <Input
                id="addressComplement"
                value={addressComplement}
                onChange={(e) => setAddressComplement(e.target.value)}
                disabled={mutation.isPending}
                placeholder="Apto, Bloco, etc."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressReference">Ponto de Referência</Label>
              <Input
                id="addressReference"
                value={addressReference}
                onChange={(e) => setAddressReference(e.target.value)}
                disabled={mutation.isPending}
                placeholder="Próximo ao shopping, etc."
              />
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Valores</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saleValue">Valor de Venda (R$)</Label>
              <Input
                id="saleValue"
                type="number"
                step="0.01"
                value={saleValue}
                onChange={(e) => setSaleValue(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaseValue">Valor de Aluguel (R$)</Label>
              <Input
                id="leaseValue"
                type="number"
                step="0.01"
                value={leaseValue}
                onChange={(e) => setLeaseValue(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condominiumValue">Valor do Condomínio (R$)</Label>
              <Input
                id="condominiumValue"
                type="number"
                step="0.01"
                value={condominiumValue}
                onChange={(e) => setCondominiumValue(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iptuValue">Valor do IPTU (R$)</Label>
              <Input
                id="iptuValue"
                type="number"
                step="0.01"
                value={iptuValue}
                onChange={(e) => setIptuValue(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueFireInsurance">
                Valor do Seguro Incêndio (R$)
              </Label>
              <Input
                id="valueFireInsurance"
                type="number"
                step="0.01"
                value={valueFireInsurance}
                onChange={(e) => setValueFireInsurance(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={financing}
                  onChange={(e) => setFinancing(e.target.checked)}
                  disabled={mutation.isPending}
                />
                <span>Aceita Financiamento</span>
              </label>
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
              <Label htmlFor="numberBedrooms">Quartos</Label>
              <Input
                id="numberBedrooms"
                type="number"
                min="0"
                value={numberBedrooms}
                onChange={(e) => setNumberBedrooms(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberSuites">Suítes</Label>
              <Input
                id="numberSuites"
                type="number"
                min="0"
                value={numberSuites}
                onChange={(e) => setNumberSuites(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberBathrooms">Banheiros</Label>
              <Input
                id="numberBathrooms"
                type="number"
                min="0"
                value={numberBathrooms}
                onChange={(e) => setNumberBathrooms(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberParkingSpaces">Vagas de Garagem</Label>
              <Input
                id="numberParkingSpaces"
                type="number"
                min="0"
                value={numberParkingSpaces}
                onChange={(e) => setNumberParkingSpaces(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberRooms">Salas</Label>
              <Input
                id="numberRooms"
                type="number"
                min="0"
                value={numberRooms}
                onChange={(e) => setNumberRooms(e.target.value)}
                disabled={mutation.isPending}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalArea">Área Total (m²) *</Label>
              <Input
                id="totalArea"
                type="number"
                step="0.01"
                min="0"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                disabled={mutation.isPending}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateArea">Área Privativa (m²) *</Label>
              <Input
                id="privateArea"
                type="number"
                step="0.01"
                min="0"
                value={privateArea}
                onChange={(e) => setPrivateArea(e.target.value)}
                disabled={mutation.isPending}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usefulArea">Área Útil (m²) *</Label>
              <Input
                id="usefulArea"
                type="number"
                step="0.01"
                min="0"
                value={usefulArea}
                onChange={(e) => setUsefulArea(e.target.value)}
                disabled={mutation.isPending}
                required
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        {/* Visibilidade */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Visibilidade</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressVisibility">
                Visibilidade do Endereço *
              </Label>
              <Select
                id="addressVisibility"
                value={addressVisibility}
                onChange={(e) =>
                  setAddressVisibility(e.target.value as AddressVisibility)
                }
                disabled={mutation.isPending}
                required
              >
                <option value="state">Apenas Estado</option>
                <option value="state_city">Estado e Cidade</option>
                <option value="up_to_neighborhood">Até o Bairro</option>
                <option value="up_to_street">Até a Rua</option>
                <option value="full_address">Endereço Completo</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibilidade dos Valores *</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibilityValues.includes("sale")}
                    onChange={() => handleVisibilityValueToggle("sale")}
                    disabled={mutation.isPending}
                  />
                  <span>Valor de Venda</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibilityValues.includes("lease")}
                    onChange={() => handleVisibilityValueToggle("lease")}
                    disabled={mutation.isPending}
                  />
                  <span>Valor de Aluguel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibilityValues.includes("condominium")}
                    onChange={() => handleVisibilityValueToggle("condominium")}
                    disabled={mutation.isPending}
                  />
                  <span>Valor do Condomínio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibilityValues.includes("iptu")}
                    onChange={() => handleVisibilityValueToggle("iptu")}
                    disabled={mutation.isPending}
                  />
                  <span>Valor do IPTU</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibilityValues.includes("fire_insurance")}
                    onChange={() => handleVisibilityValueToggle("fire_insurance")}
                    disabled={mutation.isPending}
                  />
                  <span>Valor do Seguro Incêndio</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Comodidades */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Comodidades</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "air_conditioning", label: "Ar Condicionado" },
              { value: "elevator", label: "Elevador" },
              { value: "pool", label: "Piscina" },
              { value: "grill", label: "Churrasqueira" },
              { value: "kitchen", label: "Cozinha" },
              { value: "balcony", label: "Varanda" },
              { value: "laundry_room", label: "Área de Serviço" },
              { value: "home_office", label: "Escritório" },
              { value: "internet", label: "Internet" },
              { value: "interfone", label: "Interfone" },
              { value: "doorman", label: "Porteiro" },
              { value: "gourmet_area", label: "Área Gourmet" },
              { value: "terrace", label: "Terraço" },
              { value: "closet", label: "Closet" },
              { value: "built_in_furniture", label: "Mobília Planejada" },
            ].map((amenity) => (
              <label
                key={amenity.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={amenities.includes(amenity.value as PropertyAmenity)}
                  onChange={() =>
                    handleAmenityToggle(amenity.value as PropertyAmenity)
                  }
                  disabled={mutation.isPending}
                />
                <span>{amenity.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Mídia */}
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Mídia</h2>

          <div className="space-y-6">
            {/* Imagens */}
            <div className="space-y-2">
              <Label>Imagens</Label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={mutation.isPending || uploadingImages}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending || uploadingImages}
                  className="w-full"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Imagens
                    </>
                  )}
                </Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Imagem ${index + 1}`}
                        width={400}
                        height={128}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={mutation.isPending}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vídeos */}
            <div className="space-y-2">
              <Label>Vídeos (URL do YouTube)</Label>
              <div className="flex gap-2">
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  disabled={mutation.isPending}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddVideo}
                  disabled={mutation.isPending || !newVideoUrl.trim()}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              {videos.length > 0 && (
                <div className="space-y-2 mt-4">
                  {videos.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <span className="flex-1 text-sm truncate">{url}</span>
                      <Button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        disabled={mutation.isPending}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Erro */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
