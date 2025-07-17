"use client";

import { useEffect, useState } from "react";

export function OnboardingSplash() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
            <div
                className={`flex flex-col items-center transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* PropMatch Logo */}
                <div className="mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-10 h-10"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9,22 9,12 15,12 15,22" />
                        </svg>
                    </div>
                </div>

                {/* PropMatch Brand */}
                <h1 className="text-4xl font-bold text-foreground mb-6">PropMatch</h1>

                {/* Tagline */}
                <p className="text-lg text-muted-foreground text-center max-w-sm leading-relaxed">
                    Smart, Simple Property Management for Residential Agents
                </p>

                {/* Loading indicator */}
                <div className="mt-12">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
} 