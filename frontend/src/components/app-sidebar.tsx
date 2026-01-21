"use client";

import {
  LayoutDashboard,
  FileBarChart,
  Database,
  Settings,
  User,
  ChevronRight,
  GalleryVerticalEnd,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { ConnectionStatus } from "@/components/database/connection-status";
import { DatabaseSelector } from "@/components/database/database-selector";
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';

// Define the navigation structure
type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
  action?: string; // custom action identifier
  badge?: string;
};

// Navigation configuration
// This structure defines the main sidebar menu items including nested sub-menus.
const getNavItems = (): NavItem[] => [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileBarChart,
    badge: "24",
  },
  {
    title: "Fontes de Dados",
    url: "#",
    icon: Database,
    action: "datasources",
  },
  {
    title: "Users",
    url: "/users",
    icon: User,
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
    items: [
      {
        title: "Geral",
        url: "/settings",
      },
      {
        title: "Equipe",
        url: "/settings/team",
      },
      {
        title: "Faturamento",
        url: "/settings/billing",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, client, logout } = useAuth();

  // Generate navigation items based on current context
  const items = getNavItems();

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.action === "datasources") {
      e.preventDefault();
      router.push("?action=datasources");
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
              QReports
            </span>
            {client && (
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                {client.slug}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-1">
            Database Connection
          </SidebarGroupLabel>
          <div className="px-2 space-y-2">
            <ConnectionStatus />
            <DatabaseSelector />
          </div>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Determine active state for parent items
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" &&
                    item.url !== "#" &&
                    pathname.startsWith(item.url));

                if (item.items && item.items.length > 0) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isActive} // Open if one of children is active
                      className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubActive = pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={(e) => handleNavClick(item, e)}>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs shrink-0">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.email}</span>
                <span className="truncate text-xs text-gray-500 capitalize">
                  {user?.role}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sair"
              className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOutIcon />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// Helper for the logout icon which was missing in imports
function LogOutIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-log-out">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
