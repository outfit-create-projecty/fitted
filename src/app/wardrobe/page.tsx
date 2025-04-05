"use client";

import { useState, useEffect } from "react";
import { WardrobeGrid } from "~/app/_components/wardrobe-grid";

export default function WardrobePage() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load images from localStorage when component mounts
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem('wardrobeImages');
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        console.log('Loaded images from localStorage:', parsedImages.length);
        setImages(parsedImages);
      }
    } catch (error) {
      console.error('Error loading images from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save images to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        console.log('Saving images to localStorage:', images.length);
        localStorage.setItem('wardrobeImages', JSON.stringify(images));
      } catch (error) {
        console.error('Error saving images to localStorage:', error);
      }
    }
  }, [images, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let loadedCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          loadedCount++;
          
          // Update images as each file is loaded
          if (loadedCount === files.length) {
            console.log('All files loaded, updating state with', newImages.length, 'new images');
            setImages(prevImages => [...newImages, ...prevImages]);
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-light mb-8">your wardrobe</h1>
      <WardrobeGrid images={images} onImageUpload={handleImageUpload} />
    </div>
  );
} 