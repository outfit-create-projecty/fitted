"use client";

import { useState } from "react";

type Category = {
  name: string;
  subcategories: string[];
};

const categories: Category[] = [
  {
    name: "Upper Body",
    subcategories: [
      "T-Shirts",
      "Dress Shirts",
      "Sweaters",
      "Hoodies",
      "Jackets",
      "Tank Tops",
      "Blouses",
      "Sweatshirts"
    ]
  },
  {
    name: "Lower Body",
    subcategories: [
      "Jeans",
      "Dress Pants",
      "Shorts",
      "Skirts",
      "Leggings",
      "Sweatpants",
      "Chinos"
    ]
  },
  {
    name: "Shoes",
    subcategories: [
      "Sneakers",
      "Dress Shoes",
      "Boots",
      "Sandals",
      "Loafers",
      "Heels",
      "Flats"
    ]
  },
  {
    name: "Accessories",
    subcategories: [
      "Jewelry",
      "Hats",
      "Scarves",
      "Belts",
      "Bags",
      "Watches",
      "Sunglasses"
    ]
  }
];

interface WardrobeCategoriesProps {
  onCategorySelect: (category: string, subcategory: string) => void;
}

export function WardrobeCategories({ onCategorySelect }: WardrobeCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name ?? "");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(categories[0]?.subcategories[0] ?? "");

  const currentCategory = categories.find((cat) => cat.name === selectedCategory);
  const currentSubcategories = currentCategory?.subcategories ?? [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    const category = categories.find(cat => cat.name === newCategory);
    if (category) {
      setSelectedCategory(newCategory);
      setSelectedSubcategory(category.subcategories[0]);
      onCategorySelect(newCategory, category.subcategories[0]);
    }
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubcategory = e.target.value;
    setSelectedSubcategory(newSubcategory);
    onCategorySelect(selectedCategory, newSubcategory);
  };

  return (
    <div className="mb-8 flex flex-col space-y-4 max-w-md mx-auto">
      <div className="flex flex-col space-y-2">
        <label htmlFor="category" className="text-sm font-medium text-gray-300">
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="bg-gray-800 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="subcategory" className="text-sm font-medium text-gray-300">
          Subcategory
        </label>
        <select
          id="subcategory"
          value={selectedSubcategory}
          onChange={handleSubcategoryChange}
          className="bg-gray-800 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          {currentSubcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 