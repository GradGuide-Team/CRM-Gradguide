/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/components/AuthSidebar.tsx
"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarBody,
    SidebarLink,
    useSidebar // Add this import
} from "@/components/ui/sidebar";
import {
    IconBriefcase,
    IconUser,
    IconLogout,
    IconDashboard,
    IconBook2 // Added for Students
} from "@tabler/icons-react";
// import Image from "next/image";
import { motion } from "framer-motion"; // Remove animate from import

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthSidebarProps {
    children: React.ReactNode;
    user: UserData | null;
    onLogout: () => void;
}

// Create a component that uses the sidebar context
const SidebarContent = ({ user, pathname, router }: {
    user: UserData | null;
    onLogout: () => void;
    pathname: string;
    router: any;
}) => {
    const { open, animate } = useSidebar(); // Now we can access open and animate

    const navItems = [
        {
            label: "Dashboard",
            href: "/",
            icon: <IconDashboard className="text-white h-5 w-5 shrink-0" />,
        },
        // {
        //     label: "Students",
        //     href: "/students",
        //     icon: <IconBook2 className="text-white h-5 w-5 shrink-0" />,
        // },
        // {
        //     label: "Jobs",
        //     href: "/jobpost",
        //     icon: <IconBriefcase className="text-white h-5 w-5 shrink-0" />,
        // },
        // {
        //     label: "Profile",
        //     href: "/profile",
        //     icon: <IconUser className="text-white h-5 w-5 shrink-0" />,
        // },
    ];

    const filteredNavItems = navItems.filter(() => {
        return true;
    });

    const isActiveRoute = (href: string) => {
        if (href === "#") return false;
        return pathname.startsWith(href);
    };

    const handleNavClick = (href: string, label: string) => {
        if (href === "#") {
            console.log(`Clicked on ${label} - Coming soon!`);
            return;
        }
        router.push(href);
    };

    // const handleLogout = () => {
    //     if (confirm("Are you sure you want to logout?")) {
    //         onLogout();
    //     }
    // };

    return (
        <div className="flex flex-col overflow-y-auto overflow-x-hidden">
            <div className="mb-1">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                        <span className="text-white font-bold text-lg">🎓</span>
                    </div>
                    <motion.div
                        animate={{
                            width: animate ? (open ? "auto" : "0px") : "auto",
                            opacity: animate ? (open ? 1 : 0) : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        <p className="text-lg font-semibold text-white">GradGuide CRM</p>
                        <p className="text-sm font-normal text-white/80">Application Team</p>
                    </motion.div>
                </div>

                {user && (
                    <motion.div
                        animate={{
                            width: animate ? (open ? "auto" : "0px") : "auto",
                            opacity: animate ? (open ? 1 : 0) : 1,
                            height: animate ? (open ? "auto" : "0px") : "auto",
                        }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20"
                    >
                        <div className="p-3 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white font-semibold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-white">{user.name}</p>
                                </div>
                            </div>
                            <p className="text-white/80 text-xs">{user.email}</p>
                            <p className="text-white/70 text-xs capitalize">Role: {user.role}</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {filteredNavItems.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleNavClick(item.href, item.label)}
                        className="cursor-pointer"
                    >
                        <SidebarLink
                            link={{
                                ...item,
                                href: item.href,
                            }}
                            className={`
                                ${isActiveRoute(item.href)
                                    ? "bg-white/20 backdrop-blur-sm rounded-xl pl-3 border border-white/30"
                                    : "hover:bg-white/10 rounded-xl pl-3 border border-transparent hover:border-white/20"
                                }
                                ${item.href === "#"
                                    ? "opacity-70 hover:opacity-100"
                                    : ""
                                }
                                transition-all duration-200
                            `}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AuthSidebar = ({ children, user, onLogout }: AuthSidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900">
            <Sidebar animate={true}>
                <SidebarBody className="justify-between gap-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
                    <SidebarContent 
                        user={user} 
                        onLogout={onLogout} 
                        pathname={pathname} 
                        router={router} 
                    />
                    
                    <div className="cursor-pointer bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30 hover:bg-red-500/30 transition-all duration-200">
                        <div onClick={() => {
                            if (confirm("Are you sure you want to logout?")) {
                                onLogout();
                            }
                        }}>
                            <SidebarLink
                                link={{
                                    label: "Logout",
                                    href: "#",
                                    icon: <IconLogout className="text-red-300 h-5 w-5 ml-3 shrink-0 " />,
                                }}
                                className="hover:bg-transparent rounded-xl"
                            />
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pt-16 md:pt-0">
                <main className="bg-white ">
                    {children}
                </main>
            </div>
        </div>
    );
};