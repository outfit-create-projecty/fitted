"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { ClothingItem, User } from "~/server/db/schema";
import { useState } from "react";
import { Trash2, Shirt, ShirtIcon } from "lucide-react";
import { useToast } from "~/app/components/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/app/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/app/components/ui/sheet";
import { Button } from "~/app/components/ui/button";

type Category = "all" | "tops" | "bottoms" | "misc";

export function WardrobeClient({ initialWardrobeItems, user }: { initialWardrobeItems: ClothingItem[], user: User }) {
    const { toast } = useToast();
    const [currentCategory, setCurrentCategory] = useState<Category>("all");
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

    const { data: wardrobeItems, refetch: refetchWardrobe } = api.wardrobe.list.useQuery(undefined, {
        initialData: initialWardrobeItems,
    });

    const filteredItems = wardrobeItems?.filter(item => {
        if (currentCategory === "all") return true;
        return item.classification === currentCategory;
    });

    const { mutate: deletePiece } = api.wardrobe.deletePiece.useMutation({
        onSuccess: () => {
            void refetchWardrobe();
            toast({
                title: "Success",
                description: "Your item has been deleted from your wardrobe.",
                className: "bg-green-300",
                duration: 2000,
            });
        },
    });

    const { mutate: updateStatus } = api.wardrobe.updateStatus.useMutation({
        onSuccess: () => {
            refetchWardrobe();
            toast({
                title: "Success",
                description: "Item status updated",
                className: "bg-green-300",
                duration: 2000,
            });
        },
        onError: (error: TRPCClientErrorLike<any>) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleDelete = (item: ClothingItem) => {
        deletePiece({
            id: item.id,
            userId: user.id,
        });
    };

    const handleStatusToggle = (item: ClothingItem, e: React.MouseEvent) => {
        e.stopPropagation();
        updateStatus({
            itemId: item.id,
            status: item.status === "available" ? "unavailable" : "available"
        });
    };

    return (
        <div className="w-full bg-secondary min-h-[calc(100vh-156px)] p-16">
            <div className="flex justify-between items-center mb-6 w-full">
                <h1 className="text-5xl py-4 font-extrabold text-black">Your Wardrobe</h1>
                <Link
                    href="/add"
                    className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
                >
                    Add New Piece
                </Link>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setCurrentCategory(value as Category)}>
                <TabsList className="mb-4 w-[40vw] bg-primary-foreground">
                    <TabsTrigger value="all" className="w-[8vw]">All</TabsTrigger>
                    <TabsTrigger value="top" className="w-[8vw]">Tops</TabsTrigger>
                    <TabsTrigger value="bottom" className="w-[8vw]">Bottoms</TabsTrigger>
                    <TabsTrigger value="shoes" className="w-[8vw]">Shoes</TabsTrigger>
                    <TabsTrigger value="misc" className="w-[8vw]">Misc</TabsTrigger>
                </TabsList>

                {filteredItems?.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-primary-foreground mb-4">
                            {currentCategory === "all" 
                                ? "Your wardrobe is empty" 
                                : `No ${currentCategory} in your wardrobe`}
                        </p>
                        <Link
                            href="/add"
                            className="text-blue-600 hover:text-blue-600"
                        >
                            {currentCategory === "all" 
                                ? "Add your first piece" 
                                : `Add ${currentCategory}`}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-6 gap-4">
                        {filteredItems?.map((item: ClothingItem) => (
                            <div
                                key={item.id}
                                className={`relative aspect-square border rounded-lg overflow-hidden group cursor-pointer ${
                                    item.status === "unavailable" ? "opacity-50" : ""
                                }`}
                                onClick={() => setSelectedItem(item)}
                            >
                                <img
                                    src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${item.id}`}
                                    alt={item.name}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <Button
                                            variant={item.status === "available" ? "default" : "destructive"}
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={(e) => handleStatusToggle(item, e)}
                                        >
                                            {item.status === "available" ? (
                                                <Shirt className="h-4 w-4" />
                                            ) : (
                                                <ShirtIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Tabs>

            <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <SheetContent className="p-8">
                    {selectedItem && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selectedItem.name}</SheetTitle>
                                <SheetDescription>{selectedItem.description}</SheetDescription>
                            </SheetHeader>
                            <div className="mt-4">
                                <img
                                    src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${selectedItem.id}`}
                                    alt={selectedItem.name}
                                    className="w-full rounded-lg"
                                />
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm text-gray-500">Classification: {selectedItem.classification}</p>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}