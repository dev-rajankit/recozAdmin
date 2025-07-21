
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignupAllowed, setIsSignupAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserExists = async () => {
      try {
        const response = await fetch('/api/auth/user-exists');
        const data = await response.json();
        if (data.userExists) {
          setError("Signup is disabled. Only one admin account is allowed.");
          setIsSignupAllowed(false);
        } else {
          setIsSignupAllowed(true);
        }
      } catch (err) {
        setError("Could not verify signup eligibility. Please try again later.");
        setIsSignupAllowed(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserExists();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignupAllowed) return;
    setError('');
    try {
      await signup(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Admin Sign Up</CardTitle>
          <CardDescription>
            {isSignupAllowed
              ? "Create the first and only administrator account."
              : "An administrator account already exists."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSignupAllowed ? (
            <form onSubmit={handleSignup}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                  Create Admin Account
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center text-sm text-destructive">
              <p>{error}</p>
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
