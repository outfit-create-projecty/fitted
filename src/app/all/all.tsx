"use client";

import type { Outfit, User } from "~/server/db/schema";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useToast } from "../components/hooks/use-toast";
import { Star, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import Link from "next/link";

export default function AllOutfits({ user }: { user: User }) {
    const { data: outfits, refetch } = api.outfit.list.useQuery({ userId: user.id });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
    const [rating, setRating] = useState(0);
    const { toast } = useToast();

    const rateOutfit = api.outfit.rate.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Your feedback has been submitted.",
                className: "bg-green-300",
                duration: 2000,
            });
            setRating(0);
        },
    });

    const filteredOutfits = outfits?.filter(outfit => 
        outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

    const handleRating = (outfit: Outfit, newRating: number) => {
        setRating(newRating);
        outfit.rating = newRating;
        rateOutfit.mutate({
            outfitId: outfit.id,
            rating: newRating,
        });
    };

    return (
        <div className="flex flex-col gap-4 w-full min-h-[80vh] bg-accent-light p-24">
            <div className="flex flex-col gap-4 w-full pb-8">
                <h1 className="text-5xl py-4 font-extrabold text-black">Your Outfits</h1>
                <p className="text-md text-black">You have {outfits?.length} outfits</p>
                <div className="relative w-full max-w-md flex items-center">
                    <Search className="absolute left-3 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search outfits..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full bg-white/80 rounded-full text-black"
                    />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
                {filteredOutfits.map((outfit) => (
                    <div
                        key={outfit.id}
                        className="bg-white p-8 relative aspect-square border rounded-lg overflow-hidden group flex flex-col gap-4 items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedOutfit(outfit as Outfit)}
                    >
                        <h1 className="text-3xl font-bold text-black w-full">{outfit.name}</h1>
                        <p className="text-md text-black overflow-ellipsis h-1/3 overflow-hidden w-full">{outfit.description}</p>
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-5 w-5 cursor-pointer ${
                                        star <= (outfit.rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRating(outfit as Outfit, star);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                {filteredOutfits.length === 0 && (
                    <div className="text-center text-black">
                        <Link href="/outfit" className="text-primary-dark">
                            <Button variant="link" className="text-primary-dark text-lg cursor-pointer">No outfits found! Click to create one!</Button>
                        </Link>
                    </div>
                )}
            </div>

            <Sheet open={!!selectedOutfit} onOpenChange={() => setSelectedOutfit(null)}>
                <SheetContent className="p-8 pt-[100px]">
                    <ScrollArea className="h-[80vh] pr-2">
                        {selectedOutfit && (
                            <>
                                <SheetHeader>
                                    <SheetTitle className="text-4xl font-bold pb-4">{selectedOutfit.name}</SheetTitle>
                                <div className="mt-8 grid grid-cols-2 gap-4 mb-8">
                                    {selectedOutfit.top && (
                                        <div className="p-4 border rounded-lg">
                                            <img src={selectedOutfit.top.image} alt={selectedOutfit.top.name} className="w-full object-cover" />
                                            <p className="text-sm text-gray-600">{selectedOutfit.top.name}</p>
                                        </div>
                                    )}
                                    {selectedOutfit.bottom && (
                                        <div className="p-4 border rounded-lg">
                                            <img src={selectedOutfit.bottom.image} alt={selectedOutfit.bottom.name} className="w-full object-cover" />
                                            <p className="text-sm text-gray-600">{selectedOutfit.bottom.name}</p>
                                        </div>
                                    )}
                                    {selectedOutfit.shoes && (
                                        <div className="p-4 border rounded-lg">
                                            <img src={selectedOutfit.shoes.image} alt={selectedOutfit.shoes.name} className="w-full object-cover" />
                                            <p className="text-sm text-gray-600">{selectedOutfit.shoes.name}</p>
                                        </div>
                                    )}
                                    {selectedOutfit.misc && selectedOutfit.misc.length > 0 && (
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-medium text-black">Accessories</h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedOutfit.misc.map(item => item.name).join(", ")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <SheetDescription className="text-md">{selectedOutfit.description}</SheetDescription>
                                
                                </SheetHeader>
                                <div className="mt-8">
                                    <h3 className="font-medium text-black mb-2">Rate this outfit</h3>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                            key={star}
                                            className={`h-6 w-6 cursor-pointer ${
                                                star <= (selectedOutfit.rating ?? 0)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                            onClick={() => handleRating(selectedOutfit, star)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}
