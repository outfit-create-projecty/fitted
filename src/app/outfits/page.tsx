/**
 * Outfits page component.
 * This file implements the outfit management interface with:
 * - Outfit creation and organization
 * - Drag-and-drop functionality
 * - Outfit preview and editing
 * - Seasonal and occasion-based categorization
 */

"use client";

import { useState, useEffect } from "react";
import { AddOutfitForm } from "../_components/add-outfit-form";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  imageUrl: string;
}

interface Outfit {
  id: string;
  title: string;
  items: WardrobeItem[];
  icon: string;
}

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  useEffect(() => {
    // Load wardrobe items from localStorage
    const loadWardrobeItems = () => {
      try {
        const savedItems = localStorage.getItem('wardrobeImages');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          // Convert the saved items to the WardrobeItem format
          const formattedItems = parsedItems.map((item: string, index: number) => ({
            id: `item-${index}`,
            name: `Item ${index + 1}`,
            category: 'Uncategorized',
            subcategory: 'Uncategorized',
            imageUrl: item
          }));
          setWardrobeItems(formattedItems);
        }
      } catch (error) {
        console.error('Error loading wardrobe items:', error);
      }
    };

    loadWardrobeItems();
  }, []);

  const handleAddOutfit = (newOutfit: { title: string; items: WardrobeItem[]; icon: string }) => {
    const outfit: Outfit = {
      id: Date.now().toString(),
      ...newOutfit
    };
    setOutfits([...outfits, outfit]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be connected to the backend later
    console.log("Searching for outfits with query:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-light text-center mb-8">
          Outfits <span className="font-bold">Y</span>
        </h1>

        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-4">Describe your perfect outfits</h2>
          <p className="text-gray-400 mb-6">
            Create and manage your favorite outfit combinations. Mix and match your wardrobe items to create the perfect look for any occasion.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your dream outfit here..."
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        <AddOutfitForm
          wardrobeItems={wardrobeItems}
          onAddOutfit={handleAddOutfit}
        />

        {/* Outfit Tabs */}
        <div className="mt-12">
          <h3 className="text-xl font-medium mb-4">Your Outfits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOutfit?.id === outfit.id ? 'ring-2 ring-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => setSelectedOutfit(outfit)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={outfit.icon}
                    alt="Outfit icon"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <span className="text-sm font-medium text-center">{outfit.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Outfit Details */}
        {selectedOutfit && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">{selectedOutfit.title}</h3>
              <img
                src={selectedOutfit.icon}
                alt="Outfit icon"
                className="w-8 h-8 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedOutfit.items.map((item) => (
                <div key={item.id} className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 