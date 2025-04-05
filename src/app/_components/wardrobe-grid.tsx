"use client";

import { useRef } from "react";

interface WardrobeGridProps {
  images: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WardrobeGrid({ images, onImageUpload }: WardrobeGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Upload Button */}
      <div 
        className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={handleUploadClick}
      >
        <div className="text-center">
          <div className="text-4xl font-light text-gray-400 mb-2">+</div>
          <div className="text-sm text-gray-400">upload item</div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={onImageUpload}
        />
      </div>

      {/* Image Grid */}
      {images.map((image, index) => (
        <div key={index} className="aspect-square rounded-lg overflow-hidden">
          <img 
            src={image} 
            alt={`clothing item ${index + 1}`} 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
} 