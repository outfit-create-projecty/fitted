import { useState } from "react";
import { api } from "~/trpc/react";
import type { User } from "~/server/db/schema";
import { useToast } from "~/app/components/hooks/use-toast";
import type { TRPCClientErrorLike } from "@trpc/client";

export function OutfitClient({ user }: { user: User }) {
    const { toast } = useToast();
    const [generatedOutfit, setGeneratedOutfit] = useState<any>(null);
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { mutate: createOutfit } = api.outfit.create.useMutation({
        onSuccess: (data) => {
            setGeneratedOutfit(data);
            setIsCreating(false);
            toast({
                title: "Success",
                description: "Outfit created successfully!",
                className: "bg-green-300",
                duration: 2000,
            });
        },
        onError: (error: TRPCClientErrorLike<any>) => {
            setIsCreating(false);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleCreateOutfit = () => {
        if (!description.trim()) {
            toast({
                title: "Error",
                description: "Please enter a description for your outfit",
                variant: "destructive",
            });
            return;
        }
        setIsCreating(true);
        createOutfit({ description: description.trim() });
    };

    return (
        <div className="w-full bg-secondary min-h-[calc(100vh-156px)] p-16">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-5xl py-4 font-extrabold text-black text-center">Create Outfit</h1>
                <div className="space-y-4">
                    <textarea
                        className="w-full p-4 border rounded-lg"
                        placeholder="Describe the outfit you want to create..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                    <button
                        className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50"
                        onClick={handleCreateOutfit}
                        disabled={isCreating}
                    >
                        {isCreating ? "Creating..." : "Create Outfit"}
                    </button>
                </div>
                {generatedOutfit && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">{generatedOutfit.name}</h2>
                        <p className="text-gray-600 mb-4">{generatedOutfit.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Top</h3>
                                <img
                                    src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${generatedOutfit.top.id}`}
                                    alt={generatedOutfit.top.name}
                                    className="w-full aspect-square object-cover rounded-lg"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Bottom</h3>
                                <img
                                    src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${generatedOutfit.bottom.id}`}
                                    alt={generatedOutfit.bottom.name}
                                    className="w-full aspect-square object-cover rounded-lg"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Shoes</h3>
                                <img
                                    src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${generatedOutfit.shoes.id}`}
                                    alt={generatedOutfit.shoes.name}
                                    className="w-full aspect-square object-cover rounded-lg"
                                />
                            </div>
                            {generatedOutfit.misc && generatedOutfit.misc.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Accessories</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {generatedOutfit.misc.map((item: any) => (
                                            <img
                                                key={item.id}
                                                src={`https://d2fz44w91whf0y.cloudfront.net/${user.id}/${item.id}`}
                                                alt={item.name}
                                                className="w-full aspect-square object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 