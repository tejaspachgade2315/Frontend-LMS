"use client";
import { useState, useEffect } from "react";
import * as React from "react";
import {
  BookOpen,
  GalleryVerticalEnd,
  Settings2,
  Users,
  Activity,
  LayoutDashboard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import axios from "axios";
import { getToken, setToken } from "@/lib/token";
import Cookies from "js-cookie";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Aeons Leads",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Lead Tracking",
      url: "/leads",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "All Leads",
          url: "/leads/all",
        },
      ],
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: BookOpen,
      isActive: true,
    },
    {
      title: "Activities",
      url: "/activities",
      icon: Activity,
      isActive: true,
    },
    {
      title: "Admin",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Product",
          url: "/admin/product",
        },
        {
          title: "Sales Representative",
          url: "/admin/salesRepresentative",
        },
      ],
    },
  ],
};

const salesdata = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Aeons Leads",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Lead Tracking",
      url: "/leads",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "All Leads",
          url: "/leads/all",
        },
      ],
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: BookOpen,
      isActive: true,
    },
    {
      title: "Activities",
      url: "/activities",
      icon: Activity,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [loggedInUserData, setLoggedInUserData] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);


  const fetchLoggedInUserData = async () => {
    try {
      const token = getToken("authToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Transform the API response to match the expected shape
      const userData = {
        name: response.data.user.name,
        email: response.data.user.email,
        avatar: response.data.user.profilePic || "/avatars/default-avatar.jpg", // Fallback avatar
      };
      setToken(response.data.user.role, "role");
      setLoggedInUserData(userData);
    } catch (error) {
      console.error("Error fetching logged in user data:", error);
    }
  };

  useEffect(() => {
    fetchLoggedInUserData();
  }, []);

  const role = Cookies.get("role");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {role === "salerep" && <NavMain items={salesdata.navMain} />}
        {role === "admin" && <NavMain items={data.navMain} />}
      </SidebarContent>
      <SidebarFooter>
        {/* Pass a default user object if loggedInUserData is null */}
        <NavUser
          user={loggedInUserData || { name: "", email: "", avatar: "" }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
