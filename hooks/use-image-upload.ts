"use client"
import { useState, useRef, useCallback } from "react"

interface UseImageUploadReturn {
  previewUrl: string | null
  fileInputRef: React.RefObject<HTMLInputElement>
  handleThumbnailClick: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  uploadFile: (file: File) => Promise<string | null>
  isUploading: boolean
  error: string | null
}

export function useImageUpload(): UseImageUploadReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError(null)
    }
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true)
    setError(null)

    try {
      // For demo purposes, we'll use a data URL
      // In production, you'd upload to your storage service (Supabase Storage, AWS S3, etc.)
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          setIsUploading(false)
          resolve(result)
        }
        reader.readAsDataURL(file)
      })
    } catch (err) {
      setError("Failed to upload image")
      setIsUploading(false)
      return null
    }
  }, [])

  return {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    uploadFile,
    isUploading,
    error,
  }
}