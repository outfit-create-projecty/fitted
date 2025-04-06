"use client";

import { useState, useEffect } from "react";

const prompts = ["Help! I have a meeting soon. What should I wear?", "Help! I have a date tonight. What should I wear?", "Help! I have a job interview tomorrow. What should I wear?"];

export default function Typing() {
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        // Blinking cursor effect
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    useEffect(() => {
        const currentPrompt = prompts[currentPromptIndex] || "";
        let currentIndex = 0;
        let timeout: NodeJS.Timeout;

        if (isTyping) {
            // Typing animation
            const typingInterval = setInterval(() => {
                if (currentIndex < currentPrompt.length) {
                    setDisplayedText(currentPrompt.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                    // Wait for 3 seconds before starting to type next prompt
                    timeout = setTimeout(() => {
                        setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
                        setDisplayedText("");
                        setIsTyping(true);
                    }, 3000);
                }
            }, 50);

            return () => {
                clearInterval(typingInterval);
                clearTimeout(timeout);
            };
        }
    }, [currentPromptIndex, isTyping]);

    return (
        <div className="!z-40 flex flex-col gap-8 rounded-4xl bg-gray-950 p-12">
            <h1 className="text-2xl font-bold flex flex-row items-center">
                {displayedText}
                <span className={`inline-block w-0.5 ml-0.5 h-6 bg-white ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
            </h1>
        </div>
    );
}
