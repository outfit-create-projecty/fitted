"use client";

import type { Outfit } from "~/server/db/schema";

export default function AllOutfits({ outfits }: { outfits: Outfit[] }) {
    return <div className="flex flex-col gap-4 w-full min-h-[80vh] bg-accent-light p-24">
        <h1 className="text-5xl py-4 font-extrabold text-black">Your Outfits</h1>
        <p className="text-md text-black">You have {outfits?.length} outfits</p>
        <div className="grid grid-cols-4 gap-8">
            {outfits.map((outfit) => (
                <div
                    key={outfit.id}
                    className="bg-white p-8 relative aspect-square border rounded-lg overflow-hidden group flex flex-col gap-4 items-center justify-center">
                    <h1 className="text-3xl font-bold text-black w-full">{outfit.name}</h1>
                    <p className="text-md text-black overflow-ellipsis h-1/3 overflow-hidden w-full">{outfit.description}</p>
                </div>
            ))}
        </div>
    </div>;
}
