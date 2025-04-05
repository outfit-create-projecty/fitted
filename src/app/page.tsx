"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl md:text-5xl font-light mb-6">project <span className="font-bold">Y</span></h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-12">
        create the perfect outfits using Y, click the wardrobe button below to start!
      </p>
      <Link 
        href="/wardrobe" 
        className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-200 transition-colors"
      >
        wardrobe
      </Link>
    </div>
  );
}
