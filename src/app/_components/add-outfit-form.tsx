"use client";

import { useState, useRef, useEffect } from "react";
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
  saveChanges?: () => void;
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
  existingOutfits = [],
  saveChanges
}: AddOutfitFormProps) {
  const [title, setTitle] = useState(editOutfit?.title ?? "");
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>(editOutfit?.items ?? []);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(editOutfit?.icon ?? null);
  const [showIconUpload, setShowIconUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory ?? "Upper Body");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add a state variable to track the edit mode
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(editOutfit && editMode === 'items'));
  
  // Update the isEditing state when editOutfit or editMode changes
  useEffect(() => {
    const newIsEditing = Boolean(editOutfit && editMode === 'items');
    setIsEditing(newIsEditing);
    console.log("Edit mode changed:", editMode);
    console.log("Edit outfit changed:", editOutfit ? "yes" : "no");
    console.log("Is editing:", newIsEditing);
    
    // When editing items, initialize the selected items with the outfit's items
    if (editOutfit && editMode === 'items') {
      console.log("Initializing selected items with outfit items:", editOutfit.items);
      setSelectedItems([...editOutfit.items]);
    }
  }, [editMode, editOutfit]);

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
    console.log("Adding item:", item.category, "Current items:", selectedItems.length);
    console.log("Edit mode:", editMode, "Edit outfit:", editOutfit ? "yes" : "no");
    console.log("Is editing:", isEditing);
    
    // Check if the item is already selected
    const isAlreadySelected = selectedItems.find(i => i.id === item.id);
    if (isAlreadySelected) {
      // If the item is already selected, remove it
      handleRemoveItem(item.id);
      return;
    }
    
    // Get the current category items
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
      // Replace existing item in the same category
      const newItems = selectedItems.filter(i => i.category !== item.category);
      setSelectedItems([...newItems, item]);
      setFeedbackMessage(`Replaced ${item.category} item`);
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

  const hasRequiredItems = () => {
    const hasUpperBody = selectedItems.some(item => item.category === "Upper Body");
    const hasLowerBody = selectedItems.some(item => item.category === "Lower Body");
    const hasShoes = selectedItems.some(item => item.category === "Shoes");
    return hasUpperBody && hasLowerBody && hasShoes;
  };

  const getMissingCategories = () => {
    const hasUpperBody = selectedItems.some(item => item.category === "Upper Body");
    const hasLowerBody = selectedItems.some(item => item.category === "Lower Body");
    const hasShoes = selectedItems.some(item => item.category === "Shoes");
    
    const missing = [];
    if (!hasUpperBody) missing.push("Upper Body");
    if (!hasLowerBody) missing.push("Lower Body");
    if (!hasShoes) missing.push("Shoes");
    
    return missing;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, creating outfit");
    console.log("Is editing:", isEditing);
    console.log("Edit mode:", editMode);
    
    if (isEditing && onEditOutfit) {
      // For editing, validate required items if editing items
      if (editMode === 'items' && !hasRequiredItems()) {
        setFeedbackMessage("Please select at least one Upper Body, Lower Body, and Shoes item");
        return;
      }
      
      // For editing, only update the fields that are being edited
      const updatedOutfit = {
        id: editOutfit!.id,
        title: editMode === 'title' ? (title || generateDefaultTitle()) : editOutfit!.title,
        items: editMode === 'items' ? selectedItems : editOutfit!.items,
        icon: editMode === 'icon' ? (selectedIcon || DEFAULT_ICON) : editOutfit!.icon
      };
      console.log("Submitting edited outfit:", updatedOutfit);
      console.log("Original outfit:", editOutfit);
      console.log("Selected items:", selectedItems);
      
      // Call the onEditOutfit function with the updated outfit
      onEditOutfit(updatedOutfit);
      
      // Reset form after editing outfit
      setTitle("");
      setSelectedItems([]);
      setSelectedIcon(null);
      setFeedbackMessage("Outfit updated successfully!");
    } else {
      // Only create outfit when required items are present
      if (!hasRequiredItems()) {
        setFeedbackMessage("Please select at least one Upper Body, Lower Body, and Shoes item");
        return;
      }

      // Create the outfit only when the button is explicitly clicked
      onAddOutfit({
        title: title || generateDefaultTitle(),
        items: selectedItems,
        icon: selectedIcon || DEFAULT_ICON
      });
      
      // Reset form after creating outfit
      setTitle("");
      setSelectedItems([]);
      setSelectedIcon(null);
      setFeedbackMessage("Outfit created successfully!");
    }
  };

  const filteredItems = wardrobeItems.filter(item => item.category === selectedCategory);

  const isFormValid = isEditing
    ? (editMode === 'title' ? true : true) && 
      (editMode === 'items' ? hasRequiredItems() : true) && 
      (editMode === 'icon' ? true : true)
    : hasRequiredItems();

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-white">
          {isEditing
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
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      setSelectedIcon(null);
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
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setShowIconUpload(true);
                  }}
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
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      fileInputRef.current?.click();
                    }}
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setSelectedCategory(category.value);
                  }}
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
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          handleRemoveItem(item.id);
                        }}
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
              {filteredItems.map((item) => {
                const isSelected = selectedItems.find(i => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`relative group cursor-pointer ${
                      isSelected ? 'ring-2 ring-white' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      handleAddItem(item);
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center">
                      {isSelected ? (
                        <X className="text-white" />
                      ) : (
                        <Plus className="text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Items Indicator */}
        {selectedItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">
                {hasRequiredItems() ? "Ready to create outfit!" : "Still needed:"}
              </span>
              {!hasRequiredItems() && (
                <div className="flex flex-wrap gap-2">
                  {getMissingCategories().map(category => (
                    <span key={category} className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              )}
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
            {isEditing ? "Save Changes" : "Create Outfit"}
          </button>
        </div>
      </form>
    </div>
  );
} 