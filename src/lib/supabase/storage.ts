"use client"

import { createClient } from "./client"

const supabase = createClient()

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param folder - Pasta onde salvar (ex: "thumbnails", "avatars")
 * @returns URL pública da imagem
 */
export async function uploadImage(file: File, folder: string = "thumbnails"): Promise<string> {
  // Gerar nome único para o arquivo
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  
  // Fazer upload
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    console.error("Erro no upload:", error)
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from("images")
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * Deleta uma imagem do Supabase Storage
 * @param url - URL pública da imagem
 */
export async function deleteImage(url: string): Promise<void> {
  // Extrair o path da URL
  const match = url.match(/\/images\/(.+)$/)
  if (!match) return

  const path = match[1]
  
  const { error } = await supabase.storage
    .from("images")
    .remove([path])

  if (error) {
    console.error("Erro ao deletar:", error)
  }
}

