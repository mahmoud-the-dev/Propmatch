"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";

interface OnboardingStepsProps {
    onComplete: () => void;
}

const steps = [
    {
        id: 1,
        title: "Welcome to",
        subtitle: "PropMatch",
        description: "work and organize properties",
        image: "/images/onboarding/1.png",
        backgroundColor: "bg-slate-50",
    },
    {
        id: 2,
        title: "Find the Fitting",
        subtitle: "Space",
        description: "find the best option for your clients",
        image: "/images/onboarding/2.png",
        backgroundColor: "bg-rose-50",
    },
    {
        id: 3,
        title: "Register your",
        subtitle: "Properties",
        description: "Enter photos, location, price, and many other details",
        image: "/images/onboarding/3.png",
        backgroundColor: "bg-slate-50",
    },
];

export function OnboardingSteps({ onComplete }: OnboardingStepsProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative">
            {/* Skip button overlay */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
                <button
                    onClick={onComplete}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm"
                >
                    Skip
                </button>
            </div>

            {/* Main content - Mobile: Full width, Desktop: Card */}
            <div className="flex-1 flex flex-col items-center md:justify-center">
                {/* Mobile Layout - Full Width */}
                <div className="w-full md:hidden">
                    {/* Image container - Full width on mobile */}
                    <div className={`aspect-[4/5] ${step.backgroundColor} flex items-center justify-center relative overflow-hidden`}>
                        <Image
                            src={step.image}
                            alt={`${step.title} ${step.subtitle}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Content below image on mobile */}
                    <div className="p-6 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">
                                {step.title}
                            </h2>
                            <h2 className="text-2xl font-bold text-primary">
                                {step.subtitle}
                            </h2>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {step.description}
                        </p>
                    </div>
                </div>

                {/* Desktop Layout - Keep Card Design */}
                <div className="hidden md:block w-full max-w-sm mx-auto px-4">
                    <Card className="overflow-hidden border-2 border-muted shadow-lg">
                        <CardContent className="p-0">
                            {/* Image container */}
                            <div className={`aspect-[4/5] ${step.backgroundColor} flex items-center justify-center relative overflow-hidden`}>
                                <Image
                                    src={step.image}
                                    alt={`${step.title} ${step.subtitle}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                                        {step.title}
                                    </h2>
                                    <h2 className="text-2xl md:text-3xl font-bold text-primary">
                                        {step.subtitle}
                                    </h2>
                                </div>
                                <p className="text-muted-foreground text-sm md:text-base">
                                    {step.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-background border-t border-border/10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="h-12 w-12 rounded-full bg-muted/50 hover:bg-muted disabled:opacity-50"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Step indicators */}
                <div className="flex space-x-2">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-muted"
                                }`}
                        />
                    ))}
                </div>

                <Button
                    size="icon"
                    onClick={nextStep}
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </Button>
            </div>
        </div>
    );
} 