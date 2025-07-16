/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/wrapper/authWrapper.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth'; 
import { AuthSidebar } from "@/components/AuthSidebar"; 

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;   
  redirectTo?: string;     
  showSidebar?: boolean;   
  redirectIfAuthenticated?: boolean; // NEW: Redirect if already authenticated
  redirectIfAuthenticatedTo?: string; // NEW: Where to redirect if authenticated
}

export const AuthWrapper = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
  showSidebar = true,
  redirectIfAuthenticated = false, // NEW
  redirectIfAuthenticatedTo = "/", // NEW
}: AuthWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // NEW: If this is a login/register page and user is already authenticated, redirect them
    if (redirectIfAuthenticated && isAuthenticated) {
      router.replace(redirectIfAuthenticatedTo);
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // Keep the existing logic for authenticated users on login/register pages
    if (
      isAuthenticated &&
      (pathname === "/login" || pathname === "/register") &&
      !redirectIfAuthenticated // Only apply this if not using the new redirect logic
    ) {
      router.replace("/");
      return;
    }

  }, [pathname, requireAuth, redirectTo, isAuthenticated, authLoading, router, redirectIfAuthenticated, redirectIfAuthenticatedTo]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // NEW: Don't render anything if we're redirecting authenticated users
  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAuth && showSidebar && isAuthenticated) {
    return (
      <AuthSidebar user={user} onLogout={logout}>
        {children}
      </AuthSidebar>
    );
  }

  return (
    <>
      {children}
    </>
  );
}

export const withAuth = (
  Component: React.ComponentType<any>,
  options: {
    requireAuth?: boolean;
    redirectTo?: string;
    showSidebar?: boolean;
    redirectIfAuthenticated?: boolean; // NEW
    redirectIfAuthenticatedTo?: string; // NEW
  } = {}
) => {
  const Protected = (props: any) => (
    <AuthWrapper
      requireAuth={options.requireAuth ?? true}
      redirectTo={options.redirectTo ?? "/login"}
      showSidebar={options.showSidebar ?? true}
      redirectIfAuthenticated={options.redirectIfAuthenticated ?? false} // NEW
      redirectIfAuthenticatedTo={options.redirectIfAuthenticatedTo ?? "/"} // NEW
    >
      <Component {...props} />
    </AuthWrapper>
  );
  Protected.displayName = `withAuth(${Component.displayName || Component.name})`;
  return Protected;
};