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
}

export const AuthWrapper = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
  showSidebar = true,
}: AuthWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (
      isAuthenticated &&
      (pathname === "/login" || pathname === "/register")
    ) {
      router.replace("/");
      return;
    }

  }, [pathname, requireAuth, redirectTo, isAuthenticated, authLoading, router]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAuth && showSidebar && isAuthenticated) {
    return (
      // CORRECTED: Pass user and logout to AuthSidebar
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
};

export const withAuth = (
  Component: React.ComponentType<any>,
  options: {
    requireAuth?: boolean;
    redirectTo?: string;
    showSidebar?: boolean;
  } = {}
) => {
  const Protected = (props: any) => (
    <AuthWrapper
      requireAuth={options.requireAuth ?? true}
      redirectTo={options.redirectTo ?? "/login"}
      showSidebar={options.showSidebar ?? true}
    >
      <Component {...props} />
    </AuthWrapper>
  );
  Protected.displayName = `withAuth(${Component.displayName || Component.name})`;
  return Protected;
};
