"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadImage } from "@/lib/supabase/storage"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  placeholder?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  folder = "thumbnails",
  placeholder = "Cole uma URL ou faça upload de uma imagem"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem válida (JPG, PNG, GIF, WebP)")
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err) {
      console.error("Erro no upload:", err)
      setError("Erro ao fazer upload. Tente novamente.")
    } finally {
      setIsUploading(false)
      // Limpar input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function handleRemove() {
    onChange("")
  }

  // Verifica se a URL é válida para exibir preview
  function isValidUrl(url: string): boolean {
    if (!url || url.trim() === "") return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const showPreview = isValidUrl(value)

  return (
    <div className="space-y-3">
      {/* Preview da imagem */}
      {showPreview && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Se a imagem falhar ao carregar, esconde o preview
              (e.target as HTMLImageElement).style.display = "none"
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input de URL */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        
        {/* Botão de Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Dica */}
      {!value && !error && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          Arraste uma imagem ou clique no botão para fazer upload (máx. 5MB)
        </p>
      )}
    </div>
  )
}

