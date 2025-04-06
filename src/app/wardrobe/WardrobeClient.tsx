"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import type { ClothingItem, User } from "~/server/db/schema";
import { useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/app/components/ui/alert-dialog";
import { Button } from "~/app/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "~/app/components/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/app/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "~/app/components/ui/sheet";

type Category = "all" | "tops" | "bottoms" | "misc";

export function WardrobeClient({ initialWardrobeItems, user }: { initialWardrobeItems: ClothingItem[], user: User }) {
    const { toast } = useToast();
    const [currentCategory, setCurrentCategory] = useState<Category>("all");
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

    const { data: wardrobeItems, refetch } = api.wardrobe.list.useQuery(undefined, {
        initialData: initialWardrobeItems,
    });

    const filteredItems = wardrobeItems?.filter(item => {
        if (currentCategory === "all") return true;
        return item.classification === currentCategory;
    });

    const { mutate: deletePiece } = api.wardrobe.deletePiece.useMutation({
        onSuccess: () => {
            void refetch();
            toast({
                title: "Success",
                description: "Your item has been deleted from your wardrobe.",
                className: "bg-green-300",
                duration: 2000,
            });
        },
    });

    const handleDelete = (item: ClothingItem) => {
        deletePiece({
            id: item.id,
            userId: user.id,
        });
    };

    return (
        <div className="w-full bg-secondary min-h-[calc(100vh-156px)] p-16">
            <div className="flex justify-between items-center mb-6 w-full">
                <h1 className="text-3xl font-bold">Your Wardrobe</h1>
                <Link
                    href="/add"
                    className="ml-auto px-4 py-2 bg-blue-500 text-primary-foreground rounded hover:bg-blue-600"
                >
                    Add New Piece
                </Link>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setCurrentCategory(value as Category)}>
                <TabsList className="mb-4 w-96">
                    <TabsTrigger value="all" className="w-24">All</TabsTrigger>
                    <TabsTrigger value="top" className="w-24">Tops</TabsTrigger>
                    <TabsTrigger value="bottom" className="w-24">Bottoms</TabsTrigger>
                    <TabsTrigger value="misc" className="w-24">Misc</TabsTrigger>
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
                                className="relative aspect-square border rounded-lg overflow-hidden group cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                <img
                                    src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${item.id}`}
                                    alt={item.name}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                                    <div className="absolute bottom-2 right-2">
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