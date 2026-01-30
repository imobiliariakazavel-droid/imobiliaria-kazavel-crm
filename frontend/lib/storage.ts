import { createClient } from "@/lib/supabase-client";

export async function uploadImage(
  file: File,
  propertyId?: string
): Promise<string> {
  const supabase = createClient();

  // Gerar nome único para o arquivo
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = propertyId ? `${propertyId}/${fileName}` : `temp/${fileName}`;

  // Fazer upload
  const { data, error } = await supabase.storage
    .from("properties")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }

  // Obter URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from("properties").getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteImage(filePath: string): Promise<void> {
  const supabase = createClient();

  // Extrair o caminho do arquivo da URL
  const url = new URL(filePath);
  const pathParts = url.pathname.split("/");
  const bucketIndex = pathParts.findIndex((part) => part === "properties");
  const filePathInBucket = pathParts.slice(bucketIndex + 1).join("/");

  const { error } = await supabase.storage
    .from("properties")
    .remove([filePathInBucket]);

  if (error) {
    throw new Error(`Erro ao deletar imagem: ${error.message}`);
  }
}
