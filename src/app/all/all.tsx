"use client";

import type { Outfit, User } from "~/server/db/schema";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useToast } from "../components/hooks/use-toast";
import { Star, Search, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import Link from "next/link";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

export default function AllOutfits({ user }: { user: User }) {
    const { data: outfits, refetch } = api.outfit.list.useQuery({ userId: user.id });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
    const [sortBy, setSortBy] = useState("date");
    const { toast } = useToast();

    const rateOutfit = api.outfit.rate.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Your feedback has been submitted.",
                className: "bg-green-300",
                duration: 2000,
            });
        },
    });

    const deleteOutfit = api.outfit.delete.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Your outfit has been deleted.",
                className: "bg-green-300",
                duration: 2000,
            });
            refetch();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Your outfit could not be deleted.",
                variant: "destructive",
                duration: 2000,
            });
        },
    });

    const filteredOutfits = (outfits?.filter(outfit => 
        outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.top?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.bottom?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.shoes?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? []).sort((a, b) => {
        if (sortBy === "name") {
            return a.name.localeCompare(b.name);
        } else if (sortBy === "rating") {
            return (b.rating ?? 0) - (a.rating ?? 0);
        } else if (sortBy === "score") {
            return (Number(b.score ?? 0) - Number(a.score ?? 0));
        }
        return 0;
    });

    const handleRating = (outfit: Outfit, newRating: number) => {
        outfit.rating = newRating;
        rateOutfit.mutate({
            outfitId: outfit.id,
            rating: newRating,
        });
    };

    const handleDelete = (outfit: Outfit) => {
        const index = outfits?.findIndex(o => o.id === outfit.id);
        if (index !== undefined && index !== -1) {
            outfits?.splice(index, 1);
        }
        setSelectedOutfit(null);
        deleteOutfit.mutate({
            outfitId: outfit.id,
        });
    };

    return (
        <div className="flex flex-col gap-4 w-full min-h-[80vh] bg-accent-light p-24">
            <div className="flex flex-row gap-4 w-full pb-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-5xl py-4 font-extrabold text-black">Your Outfits</h1>
                    <p className="text-md text-black">You have {outfits?.length} outfits</p>
                </div>
                <div className="ml-auto relative w-full max-w-md flex items-center gap-4">
                    <div className="flex flex-row gap-4 items-center">
                        <Search className="absolute left-3 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search outfits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full bg-white/80 rounded-full text-black"
                        />
                    </div>
                    <Select onValueChange={(value) => setSortBy(value)}>
                        <SelectTrigger className="w-40 bg-white/40 text-black font-medium rounded-xl cursor-pointer">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="score">Match Percent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
                {filteredOutfits.map((outfit) => (
                    <div
                        key={outfit.id}
                        className="bg-white p-8 relative aspect-square rounded-lg overflow-hidden group flex flex-col gap-4 items-center justify-center cursor-pointer"
                        onClick={() => setSelectedOutfit(outfit as Outfit)}
                    >
                        <h1 className="text-3xl font-bold text-black w-full">{outfit.name}</h1>
                        <p className="text-md text-black overflow-ellipsis h-1/3 overflow-hidden flex-1 w-full pb-1">{outfit.description}</p>
                        <div className="flex items-center w-full gap-1">
                            <p className="text-md text-gray-950 font-medium mr-auto">{Math.round(Number(outfit.score) * 100)}%</p>
                            <div className="flex items-center gap-1 hover:scale-[1.05] duration-300 transition-transform">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-5 w-5 cursor-pointer hover:scale-[1.25] duration-200 transition-transform  ${
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
                    <ScrollArea className="h-[80vh] pr-4">
                        {selectedOutfit && (
                            <>
                                <SheetHeader>
                                    <SheetTitle className="text-4xl font-bold pb-4">{selectedOutfit.name}</SheetTitle>
                                    <div className="mt-8 grid grid-cols-2 gap-4 mb-8">
                                    {selectedOutfit.top && (
                                        <div className="p-4 border rounded-lg">
                                            <img src={selectedOutfit.top.image} alt={selectedOutfit.top.name} className="h-[25vh] object-cover" />
                                            <p className="text-sm text-gray-600">{selectedOutfit.top.name}</p>
                                        </div>
                                    )}
                                    {selectedOutfit.bottom && (
                                        <div className="p-4 border rounded-lg">
                                            <img src={selectedOutfit.bottom.image} alt={selectedOutfit.bottom.name} className="h-[25vh] object-cover" />
                                            <p className="text-sm text-gray-600">{selectedOutfit.bottom.name}</p>
                                        </div>
                                    )}
                                    {selectedOutfit.shoes && (
                                        <div className="p-4 border rounded-lg">
                                            <img src={selectedOutfit.shoes.image} alt={selectedOutfit.shoes.name} className="h-[25vh] object-cover" />
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
                            <div className="flex flex-row gap-4 mt-8 w-full">
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-medium text-black">Rate this outfit</h3>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                            key={star}
                                            className={`h-6 w-6 cursor-pointer hover:scale-[1.25] duration-200 transition-transform ${
                                                star <= (selectedOutfit.rating ?? 0)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                            onClick={() => handleRating(selectedOutfit, star)}
                                        />
                                        ))}
                                    </div>
                                </div>
                                <div className="ml-auto mt-auto">
                                    <Button variant="destructive" size="icon" className="hover:scale-[1.05] duration-200 transition-transform cursor-pointer" onClick={() => handleDelete(selectedOutfit)}><Trash2 size="icon" /></Button>
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
