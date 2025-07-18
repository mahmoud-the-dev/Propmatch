"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full min-h-screen", className)} {...props}>
      {/* Mobile Layout - Full Width */}
      <div className="md:hidden flex flex-col w-full">
        {/* Hero Image - Full width on mobile */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src="/images/login.png"
            alt="Modern interior room with dark sofa and white dresser"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              // Fallback image
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="400" height="320" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#f1f5f9"/>
                  <rect x="50" y="200" width="120" height="80" rx="8" fill="#1e293b"/>
                  <rect x="200" y="180" width="100" height="100" rx="4" fill="#e2e8f0"/>
                  <circle cx="320" cy="150" r="30" fill="#22c55e"/>
                  <rect x="280" y="220" width="8" height="60" fill="#64748b"/>
                  <circle cx="284" cy="200" r="12" fill="#374151"/>
                </svg>
              `)}`;
            }}
          />
        </div>

        {/* Form Content - Mobile */}
        <div className="flex-1 px-6 py-8">
          <div className="w-full max-w-sm mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-navy-900" style={{ color: '#1e293b' }}>
                Welcome Back!
              </h1>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Youremail@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-gray-50 border-0 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password ••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-gray-50 border-0 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Social Login Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                </div>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don&apos;t Have An Account yet?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-semibold text-navy-900 hover:text-purple-600 transition-colors"
                  style={{ color: '#1e293b' }}
                >
                  Register
                </Link>
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex justify-center space-x-8 pt-6 text-sm text-gray-500">
              <Link href="/help" className="hover:text-gray-700 transition-colors">
                Need help?
              </Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">
                Terms & Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Card Based */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Image - Contained in card on desktop */}
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src="/images/login.png"
                alt="Modern interior room with dark sofa and white dresser"
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Fallback image
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="400" height="320" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#f1f5f9"/>
                      <rect x="50" y="200" width="120" height="80" rx="8" fill="#1e293b"/>
                      <rect x="200" y="180" width="100" height="100" rx="4" fill="#e2e8f0"/>
                      <circle cx="320" cy="150" r="30" fill="#22c55e"/>
                      <rect x="280" y="220" width="8" height="60" fill="#64748b"/>
                      <circle cx="284" cy="200" r="12" fill="#374151"/>
                    </svg>
                  `)}`;
                }}
              />
            </div>

            {/* Form Content - Desktop */}
            <div className="p-8">
              <div className="w-full space-y-6">
                {/* Welcome Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-navy-900" style={{ color: '#1e293b' }}>
                    Welcome Back!
                  </h1>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-desktop" className="text-sm font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                      Email
                    </Label>
                    <Input
                      id="email-desktop"
                      type="email"
                      placeholder="Youremail@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-gray-50 border-0 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-desktop" className="text-sm font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                      Password
                    </Label>
                    <Input
                      id="password-desktop"
                      type="password"
                      placeholder="Password ••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-gray-50 border-0 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Social Login Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading}
                        className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={isLoading}
                        className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                    </div>

                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </form>

                {/* Register Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Don&apos;t Have An Account yet?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="font-semibold text-navy-900 hover:text-purple-600 transition-colors"
                      style={{ color: '#1e293b' }}
                    >
                      Register
                    </Link>
                  </p>
                </div>

                {/* Footer Links */}
                <div className="flex justify-center space-x-8 pt-6 text-sm text-gray-500">
                  <Link href="/help" className="hover:text-gray-700 transition-colors">
                    Need help?
                  </Link>
                  <Link href="/terms" className="hover:text-gray-700 transition-colors">
                    Terms & Privacy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
