/**
 * Wardrobe page component.
 * This file implements the main wardrobe interface with:
 * - Clothing item management
 * - Category organization
 * - Item display and filtering
 * - Add/Edit/Delete functionality
 */

"use client";

import { useState, useEffect } from "react";
import { WardrobeGrid } from "~/app/_components/wardrobe-grid";
import { WardrobeCategories } from "~/app/_components/wardrobe-categories";

type WardrobeItem = {
  image: string;
  category: string;
  subcategory: string;
};

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Upper Body");
  const [selectedSubcategory, setSelectedSubcategory] = useState("T-Shirts");

  // Load items from localStorage when component mounts
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('wardrobeItems');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        console.log('Loaded items from localStorage:', parsedItems.length);
        setItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading items from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        console.log('Saving items to localStorage:', items.length);
        localStorage.setItem('wardrobeItems', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving items to localStorage:', error);
      }
    }
  }, [items, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: WardrobeItem[] = [];
    let loadedCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          newItems.push({
            image: event.target.result as string,
            category: selectedCategory,
            subcategory: selectedSubcategory
          });
          loadedCount++;
          
          // Update items as each file is loaded
          if (loadedCount === files.length) {
            console.log('All files loaded, updating state with', newItems.length, 'new items');
            setItems(prevItems => [...newItems, ...prevItems]);
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (category: string, subcategory: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  };

  const filteredItems = items.filter(
    item => item.category === selectedCategory && item.subcategory === selectedSubcategory
  );

  return (
    <div className="py-8">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-center">
        Wardrobe <span className="font-bold">Y</span>
      </h1>
      <div className="max-w-4xl mx-auto px-4">
        <WardrobeCategories onCategorySelect={handleCategorySelect} />
        <WardrobeGrid 
          images={filteredItems.map(item => item.image)} 
          onImageUpload={handleImageUpload} 
        />
      </div>
    </div>
  );
} 