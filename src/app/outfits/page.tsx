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
        setOutfits(parsedOutfits);
      }
    } catch (error) {
      console.error('Error loading outfits from localStorage:', error);
    }
  }, []);

  // Save outfits to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('outfits', JSON.stringify(outfits));
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
    const outfit: Outfit = {
      id: Date.now().toString(),
      ...newOutfit
    };
    setOutfits([...outfits, outfit]);
  };

  const handleEditOutfit = (editedOutfit: { id: string; title: string; items: WardrobeItem[]; icon: string }) => {
    if (editMode === 'items' && editedOutfit.items.length > 0) {
      // When editing a single item, merge the edited item with the existing outfit
      const originalOutfit = outfits.find(outfit => outfit.id === editedOutfit.id);
      if (originalOutfit) {
        const editedItem = editedOutfit.items[0];
        if (editedItem) {
          const updatedItems = originalOutfit.items.map(item => 
            item.id === editedItem.id ? editedItem : item
          );
          
          const updatedOutfit: Outfit = {
            ...originalOutfit,
            items: updatedItems
          };
          
          setOutfits(outfits.map(outfit => 
            outfit.id === editedOutfit.id ? updatedOutfit : outfit
          ));
        }
      }
    } else {
      // For other edit modes (title, icon), update the entire outfit
      setOutfits(outfits.map(outfit => 
        outfit.id === editedOutfit.id ? editedOutfit : outfit
      ));
    }
    setEditingOutfit(null);
    setEditMode(null);
  };

  const handleEditTitle = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditMode('title');
  };

  const handleEditItems = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditMode('items');
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
      setOutfits(outfits.filter(outfit => outfit.id !== selectedOutfit.id));
      setSelectedOutfit(null);
      setShowDeleteConfirm(false);
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
        {selectedOutfit && !editingOutfit && (
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
                <button
                  onClick={() => handleEditTitle(selectedOutfit)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Edit title"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleEditItems(selectedOutfit)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Edit items"
                >
                  <Plus size={16} />
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
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Main clothing items */}
              <div className="flex-1 space-y-2 max-w-[200px]">
                {/* Upper Body */}
                {selectedOutfit.items.filter(item => item.category === "Upper Body").map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleEditItem(selectedOutfit, item.id)}
                      className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit item"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
                {/* Lower Body */}
                {selectedOutfit.items.filter(item => item.category === "Lower Body").map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleEditItem(selectedOutfit, item.id)}
                      className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit item"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
                {/* Shoes */}
                {selectedOutfit.items.filter(item => item.category === "Shoes").map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleEditItem(selectedOutfit, item.id)}
                      className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit item"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {/* Accessories */}
              <div className="w-24 space-y-2">
                {selectedOutfit.items.filter(item => item.category === "Accessories").map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleEditItem(selectedOutfit, item.id)}
                      className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit item"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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