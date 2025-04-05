"use client";

import { useState, useRef } from "react";
import { Plus, X, Upload } from "lucide-react";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  imageUrl: string;
}

interface AddOutfitFormProps {
  wardrobeItems: WardrobeItem[];
  onAddOutfit: (outfit: { title: string; items: WardrobeItem[]; icon: string }) => void;
}

const categories = [
  { name: "Upper Body", value: "Upper Body" },
  { name: "Lower Body", value: "Lower Body" },
  { name: "Shoes", value: "Shoes" },
  { name: "Accessories", value: "Accessories" }
];

export function AddOutfitForm({ wardrobeItems, onAddOutfit }: AddOutfitFormProps) {
  const [title, setTitle] = useState("");
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [showIconUpload, setShowIconUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Upper Body");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedIcon(reader.result as string);
        setShowIconUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (item: WardrobeItem) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && selectedItems.length > 0 && selectedIcon) {
      onAddOutfit({
        title,
        items: selectedItems,
        icon: selectedIcon
      });
      setTitle("");
      setSelectedItems([]);
      setSelectedIcon("");
    }
  };

  const filteredItems = wardrobeItems.filter(item => item.category === selectedCategory);

  const isFormValid = title && selectedItems.length > 0 && selectedIcon;
  const missingRequirements = [
    !title && "Enter an outfit title",
    selectedItems.length === 0 && "Select at least one clothing item",
    !selectedIcon && "Upload an outfit icon"
  ].filter(Boolean);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-white mb-4">Create New Outfit</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="outfit-title" className="block text-sm font-medium text-gray-300 mb-1">
            Outfit Title
          </label>
          <input
            id="outfit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Enter outfit title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Outfit Icon
          </label>
          <div className="flex items-center space-x-2">
            {selectedIcon ? (
              <div className="relative">
                <img
                  src={selectedIcon}
                  alt="Outfit icon"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowIconUpload(true)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowIconUpload(true)}
                className="bg-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Upload Icon</span>
              </button>
            )}
            {showIconUpload && (
              <div className="absolute z-10 bg-gray-800 rounded-lg p-4 shadow-lg">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleIconUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black rounded-lg px-4 py-2 font-medium hover:bg-gray-100"
                >
                  Choose Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Select Clothes from Wardrobe
          </label>
          
          {/* Category Tabs */}
          <div className="flex space-x-4 mb-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.value
                    ? "bg-white text-black"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Wardrobe Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`relative group cursor-pointer ${
                  selectedItems.find(i => i.id === item.id) ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => handleAddItem(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center">
                  <Plus className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Selected Items ({selectedItems.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedItems.map((item) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {missingRequirements.length > 0 && (
          <div className="text-red-400 text-sm">
            <p className="font-medium mb-1">Missing requirements:</p>
            <ul className="list-disc list-inside">
              {missingRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-white text-black rounded-lg px-4 py-2 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Outfit
        </button>
      </form>
    </div>
  );
} 