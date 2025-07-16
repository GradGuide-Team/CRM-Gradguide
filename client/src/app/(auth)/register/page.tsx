//client\src\app\(auth)\Register\page.tsx
"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap } from 'lucide-react';

import React from 'react'
import Link from 'next/link';
import { withAuth } from '@/wrapper/authWrapper';

const Register = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { signup, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup(name, email, password);
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl relative z-10">
                <CardContent className="p-8">
                    {/* Logo + Title */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">GradGuide CRM</h1>
                        <p className="text-blue-100">Application Team Portal</p>
                        <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-4" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="team@gradguide.com"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 transition-all duration-200"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </Button>
                    </form>
                    <div className="mt-6 text-center flex justify-center items-center space-x-2">
                        <p className="text-sm text-white/70">Already have an account? </p>
                        <Link href="/login" className="text-sm hover:underline hover:cursor-pointer">
                            Login
                        </Link>
                    </div>
                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/70">Restricted to Application Team Members</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAuth(Register, {
  requireAuth: false,           
  showSidebar: false,          
  redirectIfAuthenticated: true,
  redirectIfAuthenticatedTo: "/"
});
