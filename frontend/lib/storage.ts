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

/**
 * Move imagens da pasta temp para a pasta do imóvel
 * @param imageUrls - Array de URLs das imagens em temp/
 * @param propertyId - ID do imóvel
 * @returns Array de novas URLs das imagens na pasta do imóvel
 */
export async function moveImagesFromTemp(
  imageUrls: string[],
  propertyId: string
): Promise<string[]> {
  const supabase = createClient();

  const movedUrls: string[] = [];

  for (const imageUrl of imageUrls) {
    try {
      // Extrair o caminho do arquivo da URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.findIndex((part) => part === "properties");
      const oldPath = pathParts.slice(bucketIndex + 1).join("/");

      // Verificar se a imagem está em temp/
      if (!oldPath.startsWith("temp/")) {
        // Se não estiver em temp/, manter a URL original
        movedUrls.push(imageUrl);
        continue;
      }

      // Extrair o nome do arquivo
      const fileName = oldPath.replace("temp/", "");
      const newPath = `${propertyId}/${fileName}`;

      // Baixar o arquivo
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("properties")
        .download(oldPath);

      if (downloadError || !fileData) {
        console.error(`Erro ao baixar imagem ${oldPath}:`, downloadError);
        // Se não conseguir mover, manter a URL original
        movedUrls.push(imageUrl);
        continue;
      }

      // Fazer upload na nova localização
      const { error: uploadError } = await supabase.storage
        .from("properties")
        .upload(newPath, fileData, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(`Erro ao fazer upload da imagem ${newPath}:`, uploadError);
        // Se não conseguir mover, manter a URL original
        movedUrls.push(imageUrl);
        continue;
      }

      // Deletar o arquivo antigo
      const { error: deleteError } = await supabase.storage
        .from("properties")
        .remove([oldPath]);

      if (deleteError) {
        console.error(`Erro ao deletar imagem antiga ${oldPath}:`, deleteError);
        // Continuar mesmo se não conseguir deletar
      }

      // Obter nova URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("properties").getPublicUrl(newPath);

      movedUrls.push(publicUrl);
    } catch (error) {
      console.error(`Erro ao mover imagem ${imageUrl}:`, error);
      // Se houver erro, manter a URL original
      movedUrls.push(imageUrl);
    }
  }

  return movedUrls;
}