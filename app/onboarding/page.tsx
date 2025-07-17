"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingSplash } from "@/components/onboarding-splash";
import { OnboardingSteps } from "@/components/onboarding-steps";

export default function OnboardingPage() {
    const [showSplash, setShowSplash] = useState(true);

    console.log("🚀🚀🚀 ~ file: page.tsx:11 ~ OnboardingPage ~ showSplash:", showSplash)

    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000); // Show splash for 3 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleOnboardingComplete = () => {
        // Set the onboarded cookie and redirect to protected page
        document.cookie = "onboarded=true; path=/; max-age=" + (365 * 24 * 60 * 60); // 1 year
        router.push("/protected");
    };

    if (showSplash) {
        return <OnboardingSplash />;
    }

    return <OnboardingSteps onComplete={handleOnboardingComplete} />;
} 