'use client';

// ============================================================================
// BU Trade — Client-Side Multi-Image Uploader with WebP Compression
// ============================================================================

import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploaderProps) {
  const [compressing, setCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File): Promise<string> => {
    // Only process image MIME types
    if (!file.type.startsWith('image/')) {
      throw new Error(`File "${file.name}" is not an image.`);
    }

    try {
      // Primary route: client-side WebP compression via browser-image-compression
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: typeof window !== 'undefined' && typeof Worker !== 'undefined',
        fileType: 'image/webp',
        initialQuality: 0.8,
      };

      const compressed = await imageCompression(file, options);
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      return dataUrl;
    } catch {
      // Graceful fallback: for test/jsdom environments where Canvas/Workers aren't supported
      return await readFileAsDataUrl(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setErrorMessage(null);
    setCompressing(true);

    try {
      const selectedFiles = Array.from(e.target.files);
      const remainingSlots = maxImages - images.length;

      if (remainingSlots <= 0) {
        setErrorMessage(`You can upload a maximum of ${maxImages} photos.`);
        setCompressing(false);
        return;
      }

      if (selectedFiles.length > remainingSlots) {
        setErrorMessage(`Only up to ${maxImages} photos allowed. Processing first ${remainingSlots}.`);
      }

      const filesToProcess = selectedFiles.slice(0, remainingSlots);
      const newImages: string[] = [];

      for (const file of filesToProcess) {
        const url = await processFile(file);
        newImages.push(url);
      }

      const combined = [...images, ...newImages].slice(0, maxImages);
      onChange(combined);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process images. Please try again.');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="w-full space-y-3">
      {/* Upload Zone & Slot Counter */}
      <div className="flex items-center justify-between text-[13px]">
        <label className="font-semibold text-[#14203b] flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-[#062a6e]" />
          <span>Product Photos</span>
          <span className="text-[#5a6580] font-normal text-[12px]">(WebP, max {maxImages})</span>
        </label>
        <span
          className={`font-medium text-[12px] ${
            images.length >= maxImages ? 'text-[#c8102e] font-semibold' : 'text-[#5a6580]'
          }`}
        >
          {images.length} / {maxImages} uploaded
        </span>
      </div>

      {/* Grid of uploaded thumbnails + upload button */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className="aspect-square relative rounded-xl border border-[#e1e6f0] overflow-hidden bg-[#f3f5fa] group shadow-xs"
          >
            <img
              src={imgUrl}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Cover Photo Badge on First Image */}
            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-[#062a6e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Cover Photo
              </span>
            )}

            {/* Remove Button */}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white text-[#c8102e] rounded-full shadow-sm border border-[#e1e6f0] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Upload Trigger Tile */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing}
            className="aspect-square border-2 border-dashed border-[#e1e6f0] hover:border-[#062a6e] rounded-xl flex flex-col items-center justify-center p-3 text-center transition-colors bg-white hover:bg-[#f3f5fa] group cursor-pointer focus:outline-none"
          >
            {compressing ? (
              <>
                <Loader2 className="w-6 h-6 text-[#062a6e] animate-spin mb-1" />
                <span className="text-[11px] text-[#5a6580] font-medium">Compressing...</span>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-[#f3f5fa] group-hover:bg-[#e1e6f0] flex items-center justify-center mb-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-[#062a6e]" />
                </div>
                <span className="text-[12px] font-semibold text-[#062a6e]">Add photos</span>
                <span className="text-[10px] text-[#5a6580] mt-0.5">Up to {maxImages}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || compressing}
        className="hidden"
      />

      {/* Error / Alert Message */}
      {errorMessage && (
        <p className="text-[12px] text-[#c8102e] bg-[#c8102e]/5 px-3 py-1.5 rounded-lg border border-[#c8102e]/20">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
