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
import { X, Trash2, Pencil, Plus, Image, Edit } from "lucide-react";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [editMode, setEditMode] = useState<'title' | 'items' | 'icon' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);

  // Load outfits from localStorage when component mounts
  useEffect(() => {
    try {
      const savedOutfits = localStorage.getItem('outfits');
      if (savedOutfits) {
        const parsedOutfits = JSON.parse(savedOutfits);
        console.log("Loaded outfits from localStorage:", parsedOutfits);
        setOutfits(parsedOutfits);
        
        // If there's a selected outfit, make sure it's still in the loaded outfits
        if (selectedOutfit) {
          const selectedOutfitStillExists = parsedOutfits.some(
            (outfit: Outfit) => outfit.id === selectedOutfit.id
          );
          
          if (!selectedOutfitStillExists) {
            console.log("Selected outfit no longer exists, resetting selected outfit");
            setSelectedOutfit(null);
          } else {
            // Update the selected outfit with the latest version from localStorage
            const updatedSelectedOutfit = parsedOutfits.find(
              (outfit: Outfit) => outfit.id === selectedOutfit.id
            );
            console.log("Updating selected outfit with latest version:", updatedSelectedOutfit);
            setSelectedOutfit(updatedSelectedOutfit);
          }
        }
      }
    } catch (error) {
      console.error('Error loading outfits from localStorage:', error);
    }
  }, []);

  // Save outfits to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('outfits', JSON.stringify(outfits));
      console.log("Saved outfits to localStorage:", outfits);
      
      // If there's a selected outfit, make sure it's updated in the state
      if (selectedOutfit) {
        const updatedSelectedOutfit = outfits.find(
          (outfit: Outfit) => outfit.id === selectedOutfit.id
        );
        
        if (updatedSelectedOutfit && JSON.stringify(updatedSelectedOutfit) !== JSON.stringify(selectedOutfit)) {
          console.log("Updating selected outfit with latest version:", updatedSelectedOutfit);
          setSelectedOutfit(updatedSelectedOutfit);
        }
      }
    } catch (error) {
      console.error('Error saving outfits to localStorage:', error);
    }
  }, [outfits]);

  // Load wardrobe items from localStorage
  useEffect(() => {
    const loadWardrobeItems = () => {
      try {
        const savedItems = localStorage.getItem('wardrobeItems');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          const formattedItems = parsedItems.map((item: { image: string, category: string, subcategory: string }, index: number) => ({
            id: `item-${index}`,
            name: `Item ${index + 1}`,
            category: item.category,
            subcategory: item.subcategory,
            imageUrl: item.image
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
    console.log("Creating new outfit:", newOutfit.title, "with items:", newOutfit.items.length);
    const outfit: Outfit = {
      id: Date.now().toString(),
      ...newOutfit
    };
    const updatedOutfits = [...outfits, outfit];
    setOutfits(updatedOutfits);
    
    // Immediately save to localStorage
    try {
      localStorage.setItem('outfits', JSON.stringify(updatedOutfits));
      console.log("Immediately saved new outfit to localStorage:", updatedOutfits);
    } catch (error) {
      console.error('Error saving outfits to localStorage:', error);
    }
  };

  const handleEditOutfit = (editedOutfit: { id: string; title: string; items: WardrobeItem[]; icon: string }) => {
    console.log("handleEditOutfit called with:", editedOutfit);
    console.log("Current editMode:", editMode);
    console.log("Current outfits before update:", outfits);
    
    // Always update the entire outfit with the edited outfit
    console.log("Updating outfit:", editedOutfit);
    
    // Create a new array with the updated outfit
    const updatedOutfits = [...outfits];
    const index = updatedOutfits.findIndex(outfit => outfit.id === editedOutfit.id);
    
    if (index !== -1) {
      console.log("Found matching outfit at index", index, "updating it");
      updatedOutfits[index] = editedOutfit;
    } else {
      console.log("No matching outfit found, adding new outfit");
      updatedOutfits.push(editedOutfit);
    }
    
    console.log("Updated outfits:", updatedOutfits);
    
    // Update the outfits state with the new array
    setOutfits(updatedOutfits);
    
    // Immediately save to localStorage
    try {
      localStorage.setItem('outfits', JSON.stringify(updatedOutfits));
      console.log("Immediately saved updated outfits to localStorage:", updatedOutfits);
    } catch (error) {
      console.error('Error saving outfits to localStorage:', error);
    }
    
    // Reset editing state
    setEditingOutfit(null);
    setEditMode(null);
    
    // Update the selected outfit if it's the one being edited
    if (selectedOutfit && selectedOutfit.id === editedOutfit.id) {
      console.log("Updating selected outfit with edited outfit:", editedOutfit);
      setSelectedOutfit(editedOutfit);
    }
    
    // Don't reset selected category or items
    // setSelectedCategory(null);
    // setSelectedItems([]);
  };

  const handleEditTitle = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditMode('title');
  };

  const handleEditItems = (outfit: Outfit) => {
    console.log("handleEditItems called with outfit:", outfit);
    setEditingOutfit(outfit);
    setEditMode('items');
    console.log("Set editMode to 'items'");
    // Don't reset category selection or selected items
    // The AddOutfitForm component will handle this
  };

  const handleEditIcon = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditMode('icon');
  };

  const handleEditItem = (outfit: Outfit, itemId: string) => {
    setEditingOutfit(outfit);
    setEditMode('items');
    // Pre-select the category of the item being edited
    const itemToEdit = outfit.items.find(item => item.id === itemId);
    if (itemToEdit) {
      setSelectedCategory(itemToEdit.category);
      // Set the selected items to only include the item being edited
      setSelectedItems([itemToEdit]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be connected to the backend later
    console.log("Searching for outfits with query:", searchQuery);
  };

  const handleDeleteOutfit = () => {
    if (selectedOutfit) {
      const updatedOutfits = outfits.filter(outfit => outfit.id !== selectedOutfit.id);
      setOutfits(updatedOutfits);
      setSelectedOutfit(null);
      setShowDeleteConfirm(false);
      
      // Immediately save to localStorage
      try {
        localStorage.setItem('outfits', JSON.stringify(updatedOutfits));
        console.log("Immediately saved after deleting outfit to localStorage:", updatedOutfits);
      } catch (error) {
        console.error('Error saving outfits to localStorage:', error);
      }
    }
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

        {editingOutfit ? (
          <AddOutfitForm
            wardrobeItems={wardrobeItems}
            onAddOutfit={handleAddOutfit}
            onEditOutfit={handleEditOutfit}
            editOutfit={editingOutfit}
            onCancelEdit={() => {
              setEditingOutfit(null);
              setEditMode(null);
            }}
            editMode={editMode}
            existingOutfits={outfits}
          />
        ) : (
          <AddOutfitForm
            wardrobeItems={wardrobeItems}
            onAddOutfit={handleAddOutfit}
            existingOutfits={outfits}
          />
        )}

        {/* Outfit Tabs */}
        {outfits.length > 0 && (
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
                    {outfit.icon.startsWith('data:') ? (
                      <img
                        src={outfit.icon}
                        alt="Outfit icon"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center text-4xl bg-gray-700 rounded-lg">
                        {outfit.icon}
                      </div>
                    )}
                    <span className="text-sm font-medium text-center">{outfit.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Outfit Details */}
        {selectedOutfit && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">{selectedOutfit.title}</h3>
              <div className="flex items-center space-x-2">
                {selectedOutfit.icon.startsWith('data:') ? (
                  <img
                    src={selectedOutfit.icon}
                    alt="Outfit icon"
                    className="w-6 h-6 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center text-lg bg-gray-700 rounded-lg">
                    {selectedOutfit.icon}
                  </div>
                )}
                {!editingOutfit && (
                  <>
                    <button
                      onClick={() => handleEditTitle(selectedOutfit)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Edit title"
                    >
                      <span className="text-lg font-bold">T</span>
                    </button>
                    <button
                      onClick={() => handleEditItems(selectedOutfit)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Edit items"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleEditIcon(selectedOutfit)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Edit icon"
                    >
                      <Image size={16} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete outfit"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedOutfit(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Close"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {!editingOutfit && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {selectedOutfit.items.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-medium mb-4">Delete Outfit</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this outfit? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOutfit}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 