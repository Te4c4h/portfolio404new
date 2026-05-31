"use client";

import { useState, useCallback } from "react";
import { FiX, FiLoader, FiVideo } from "react-icons/fi";

interface VideoUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  maxSizeMB: number;
  acceptedFormats: string[];
  folder?: string;
}

export default function VideoUpload({
  label,
  value,
  onChange,
  maxSizeMB,
  acceptedFormats,
  folder = "content",
}: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const validateFile = (file: File): string | null => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB (current: ${fileSizeMB.toFixed(2)}MB)`;
    }
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = acceptedFormats.map((f) => f.toLowerCase());
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return `Invalid format. Accepted: ${acceptedFormats.join(", ")}`;
    }
    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        onChange(data.secure_url);
        setPreview(data.secure_url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    setError(null);
  };

  const formatInfo = () => {
    return `Max ${maxSizeMB}MB • ${acceptedFormats.join(", ")}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-[var(--muted)] mb-1 block">{label}</label>

      {preview ? (
        <div className="relative w-full">
          <video
            src={preview}
            controls
            playsInline
            className="w-full max-h-72 rounded-lg border border-[var(--border)] bg-black object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-[var(--danger)] text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <FiX size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging
              ? "border-[var(--accent)] bg-[var(--accent)]/5"
              : "border-[var(--border)] hover:border-[var(--muted)]"
            }
            ${isUploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input
            type="file"
            accept={acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(",")}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <FiLoader className="animate-spin text-[var(--accent)]" size={24} />
              <span className="text-sm text-[var(--muted)]">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FiVideo className="text-[var(--muted)]" size={24} />
              <span className="text-sm text-[var(--foreground)]">
                Click or drag to upload
              </span>
              <span className="text-xs text-[var(--muted)]">{formatInfo()}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[var(--danger)] text-xs">{error}</p>}
    </div>
  );
}
