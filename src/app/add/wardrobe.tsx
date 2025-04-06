"use client";

import { useState } from "react";
import type { User } from "~/server/db/schema";
import { api } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";

export default function Wardrobe({ user }: { user: User }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadComplete, setUploadComplete] = useState(false);
    const { mutate: addPiece } = api.wardrobe.addPiece.useMutation({
        onSuccess: (data) => {
            console.log("Upload successful:", data);
            setUploadProgress(100);
            setUploadComplete(true);
        },
        onError: (error) => {
            console.error("Upload failed:", error);
            setIsUploading(false);
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadComplete(false);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64String = event.target.result as string;
                    // Send to server
                    addPiece({ 
                        userId: user.id, 
                        imageBase64: base64String,
                        fileType: file.type 
                    });
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload failed:', error);
            setIsUploading(false);
        }
    };

    const handleNewUpload = () => {
        setImagePreview(null);
        setUploadComplete(false);
        setIsUploading(false);
        setUploadProgress(0);
    };

    return (
        <div className="w-full max-w-2xl p-6">
            <h1 className="text-3xl font-bold mb-6">Add to Wardrobe</h1>
            
            <div className="space-y-4">
                {!uploadComplete ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="file-upload"
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
                                        <p className="text-lg">Click to upload an image</p>
                                        <p className="text-sm">or drag and drop</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {imagePreview && (
                            <div className="relative w-full h-64">
                                <Image
                                    src={imagePreview}
                                    alt="Uploaded clothing"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleNewUpload}
                                className="px-4 py-2 bg-blue-500 text-primary-foreground rounded hover:bg-blue-600"
                            >
                                Upload Another Piece
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
