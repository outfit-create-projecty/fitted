"use client";

import { useState } from "react";
import type { User } from "~/server/db/schema";
import { api } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "../components/hooks/use-toast";

export default function Wardrobe({ user }: { user: User }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadComplete, setUploadComplete] = useState(false);
    const { toast } = useToast();
    const { mutate: addPiece } = api.wardrobe.addPiece.useMutation({
        onSuccess: (data) => {
            console.log("Upload successful:", data);
            setUploadProgress(100);
            setUploadComplete(true);
            toast({
                title: "Success",
                description: "Item added to wardrobe",
                className: "bg-green-300",
                duration: 2000,
            });
        },
        onError: (error) => {
            console.error("Upload failed:", error);
            setIsUploading(false);
            toast({
                title: "Error",
                description: "Failed to add item",
                variant: "destructive",
            });
        },
    });

    const handleFileUpload = async (files: FileList) => {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadComplete(false);
        setImagePreviews([]);

        const newPreviews: string[] = [];
        const uploadPromises: Promise<void>[] = [];

        Array.from(files).forEach((file) => {
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            newPreviews.push(previewUrl);

            // Create upload promise
            const uploadPromise = new Promise<void>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        const base64String = event.target.result as string;
                        addPiece({ 
                            userId: user.id, 
                            imageBase64: base64String,
                            fileType: file.type 
                        });
                    }
                    resolve();
                };
                reader.readAsDataURL(file);
            });
            uploadPromises.push(uploadPromise);
        });

        setImagePreviews(newPreviews);

        try {
            await Promise.all(uploadPromises);
            setUploadProgress(100);
            setUploadComplete(true);
        } catch (error) {
            console.error('Upload failed:', error);
            setIsUploading(false);
            toast({
                title: "Error",
                description: "Failed to upload some files",
                variant: "destructive",
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files);
        }
    };

    const handleNewUpload = () => {
        setImagePreviews([]);
        setUploadComplete(false);
        setIsUploading(false);
        setUploadProgress(0);
    };

    return (
        <div className="w-full max-w-2xl p-6">
            <h1 className="text-3xl font-bold mb-6">Add to Wardrobe</h1>
            
            <div className="space-y-4">
                {!uploadComplete ? (
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            disabled={isUploading}
                            className="hidden"
                            id="file-upload"
                            multiple
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer block"
                        >
                            <div className="text-gray-600">
                                {isUploading ? (
                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p>Uploading... {uploadProgress}%</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-lg">Click to upload images</p>
                                        <p className="text-sm">or drag and drop multiple files</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square">
                                    <Image
                                        src={preview}
                                        alt={`Uploaded clothing ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleNewUpload}
                                className="px-4 py-2 bg-blue-500 text-primary-foreground rounded hover:bg-blue-600"
                            >
                                Upload More Pieces
                            </button>
                            <Link
                                href="/wardrobe"
                                className="px-4 py-2 bg-green-500 text-primary-foreground rounded hover:bg-green-600"
                            >
                                View Wardrobe
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
