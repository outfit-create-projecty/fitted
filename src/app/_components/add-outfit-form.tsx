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
  onEditOutfit?: (outfit: { id: string; title: string; items: WardrobeItem[]; icon: string }) => void;
  editOutfit?: Outfit;
  onCancelEdit?: () => void;
  editMode?: 'title' | 'items' | 'icon' | null;
  selectedCategory?: string | null;
  existingOutfits?: Outfit[];
}

interface Outfit {
  id: string;
  title: string;
  items: WardrobeItem[];
  icon: string;
}

const categories = [
  { name: "Upper Body", value: "Upper Body" },
  { name: "Lower Body", value: "Lower Body" },
  { name: "Shoes", value: "Shoes" },
  { name: "Accessories", value: "Accessories" }
];

const DEFAULT_ICON = "👕"; // Default shirt emoji

export function AddOutfitForm({ 
  wardrobeItems, 
  onAddOutfit, 
  onEditOutfit,
  editOutfit,
  onCancelEdit,
  editMode,
  selectedCategory: initialCategory,
  existingOutfits = []
}: AddOutfitFormProps) {
  const [title, setTitle] = useState(editOutfit?.title ?? "");
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>(editOutfit?.items ?? []);
  const [selectedIcon, setSelectedIcon] = useState<string>(editOutfit?.icon ?? DEFAULT_ICON);
  const [showIconUpload, setShowIconUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory ?? "Upper Body");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
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
    if (editOutfit && editMode === 'items') {
      // When editing a single item, just update that item
      setSelectedItems([item]);
      setFeedbackMessage(`Selected new ${item.category} item`);
    } else {
      const categoryItems = selectedItems.filter(i => i.category === item.category);
      
      if (item.category === "Accessories") {
        // Allow multiple accessories
        if (!selectedItems.find(i => i.id === item.id)) {
          setSelectedItems([...selectedItems, item]);
          setFeedbackMessage("Added accessory");
        }
      } else if (categoryItems.length === 0) {
        // Allow only one item per other categories
        setSelectedItems([...selectedItems, item]);
        setFeedbackMessage(`Added ${item.category} item`);
      } else {
        setFeedbackMessage(`You can only have one ${item.category} item`);
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const itemToRemove = selectedItems.find(item => item.id === itemId);
    if (itemToRemove) {
      setSelectedItems(selectedItems.filter(item => item.id !== itemId));
      setFeedbackMessage(`Removed ${itemToRemove.category} item`);
    }
  };

  const generateDefaultTitle = () => {
    const unnamedOutfits = existingOutfits.filter(outfit => 
      outfit.title.startsWith("UnNamed outfit")
    );
    const nextNumber = unnamedOutfits.length + 1;
    return `UnNamed outfit ${nextNumber}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editOutfit && onEditOutfit) {
      // For editing, only update the fields that are being edited
      const updatedOutfit = {
        id: editOutfit.id,
        title: editMode === 'title' ? (title || generateDefaultTitle()) : editOutfit.title,
        items: editMode === 'items' ? selectedItems : editOutfit.items,
        icon: editMode === 'icon' ? selectedIcon : editOutfit.icon
      };
      onEditOutfit(updatedOutfit);
    } else if (selectedItems.length > 0) {
      onAddOutfit({
        title: title || generateDefaultTitle(),
        items: selectedItems,
        icon: selectedIcon
      });
      setTitle("");
      setSelectedItems([]);
      setSelectedIcon(DEFAULT_ICON);
    }
  };

  const filteredItems = wardrobeItems.filter(item => item.category === selectedCategory);

  const isFormValid = editOutfit 
    ? (editMode === 'title' ? true : true) && 
      (editMode === 'items' ? selectedItems.length > 0 : true) && 
      (editMode === 'icon' ? true : true)
    : selectedItems.length > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-white">
          {editOutfit 
            ? `Edit ${editMode === 'title' ? 'Title' : editMode === 'items' ? 'Items' : 'Icon'}`
            : "Create New Outfit"}
        </h3>
        {editOutfit && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {(editMode === 'title' || !editOutfit) && (
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
              required={!editOutfit}
              autoComplete="off"
            />
          </div>
        )}

        {(editMode === 'icon' || !editOutfit) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Outfit Icon (Optional)
            </label>
            <div className="flex items-center space-x-2">
              {selectedIcon ? (
                <div className="relative">
                  {selectedIcon.startsWith('data:') ? (
                    <img
                      src={selectedIcon}
                      alt="Outfit icon"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-700 rounded-lg">
                      {selectedIcon}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIcon(DEFAULT_ICON);
                      setShowIconUpload(false);
                    }}
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
        )}

        {(editMode === 'items' || !editOutfit) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {editOutfit ? "Select Replacement Item" : "Select Clothes from Wardrobe"}
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

            {/* Feedback Message */}
            {feedbackMessage && (
              <div className="mb-4 text-sm text-gray-300">
                {feedbackMessage}
              </div>
            )}

            {/* Selected Items Display */}
            {selectedItems.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {editOutfit ? "Current Items" : "Selected Items"} ({selectedItems.length})
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
        )}

        <div className="flex space-x-4">
          {editOutfit && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`${editOutfit ? 'flex-1' : 'w-full'} bg-white text-black rounded-lg px-4 py-2 font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {editOutfit ? "Save Changes" : "Create Outfit"}
          </button>
        </div>
      </form>
    </div>
  );
} 