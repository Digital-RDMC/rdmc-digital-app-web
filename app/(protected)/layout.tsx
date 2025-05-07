/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Appslider from "@/components/appSlider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

import Image from "next/image";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  ActivityIcon,
  ArrowUpFromDotIcon,
  BellIcon,
  BoxesIcon,
  HandshakeIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SquaresIntersectIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

// const navData = [
//   {
//     title: "Getting Started",
//     url: "#",
//     items: [
//       {
//         title: "Installation",
//         url: "#",
//       },
//       {
//         title: "Project Structure",
//         url: "#",
//       },
//     ],
//   },
//   {
//     title: "Building Your Application",
//     url: "#",
//     items: [
//       {
//         title: "Routing",
//         url: "#",
//       },
//       {
//         title: "Data Fetching",
//         url: "#",
//         isActive: true,
//       },
//       {
//         title: "Rendering",
//         url: "#",
//       },
//       {
//         title: "Caching",
//         url: "#",
//       },
//       {
//         title: "Styling",
//         url: "#",
//       },
//       {
//         title: "Optimizing",
//         url: "#",
//       },
//       {
//         title: "Configuring",
//         url: "#",
//       },
//       {
//         title: "Testing",
//         url: "#",
//       },
//       {
//         title: "Authentication",
//         url: "#",
//       },
//       {
//         title: "Deploying",
//         url: "#",
//       },
//       {
//         title: "Upgrading",
//         url: "#",
//       },
//       {
//         title: "Examples",
//         url: "#",
//       },
//     ],
//   },
// {
//   title: "API Reference",
//   url: "#",
//   items: [
//     {
//       title: "Components",
//       url: "#",
//     },
//     {
//       title: "File Conventions",
//       url: "#",
//     },
//     {
//       title: "Functions",
//       url: "#",
//     },
//     {
//       title: "next.config.js Options",
//       url: "#",
//     },
//     {
//       title: "CLI",
//       url: "#",
//     },
//     {
//       title: "Edge Runtime",
//       url: "#",
//     },
//   ],
// },
// {
//   title: "Architecture",
//   url: "#",
//   items: [
//     {
//       title: "Accessibility",
//       url: "#",
//     },
//     {
//       title: "Fast Refresh",
//       url: "#",
//     },
//     {
//       title: "Next.js Compiler",
//       url: "#",
//     },
//     {
//       title: "Supported Browsers",
//       url: "#",
//     },
//     {
//       title: "Turbopack",
//       url: "#",
//     },
//   ],
// },
// {
//   title: "Community",
//   url: "#",
//   items: [
//     {
//       title: "Contribution Guide",
//       url: "#",
//     },
//   ],
// },
// ];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { data: session } = useSession();
  const logout = async () => {
    await signOut();
  };

  const [navData, setNavData] = useState<
    {
      title: string;
      url: string;
      icon?: React.ReactNode;
      isAuthenticated?: boolean; 
      items?: {
        title: string;
        url: string;
        icon?: React.ReactNode;
        isActive?: boolean;
        isAuthenticated?: boolean; // Added to extend the type definition
      }[];
    }[]
  >([
    {
      title: "Home",
      url: "/",
      isAuthenticated: true,
      icon: <HomeIcon />,
    },
    {
      title: "Getting Started",
      url: "#",
      isAuthenticated: true,
      items: [
        {
          title: "Activities",
          url: "/activities",
          isAuthenticated: true,
          icon: <ActivityIcon />,
        },
        {
          title: "Lead status",
          url: "/leadStatus",
          icon: <HandshakeIcon />,
        },
        {
          title: "Lead source",
          url: "/leadSource",
          icon: <ArrowUpFromDotIcon />,
        },
        {
          title: "Lead category",
          url: "/leadCategory",
          icon: <BoxesIcon />,
        },
        {
          title: "Lead type",
          url: "/leadType",
          icon: <SquaresIntersectIcon />,
        },
      ],
    },
  ]);
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (session?.user && navData.length === 2) {
      setNavData([
        ...navData,
        {
          title: "HR Admin",
          url: "#",
          isAuthenticated: (session.user?.departmentId === "6817d3824266566bf6a63c1e" || session.user?.unitId === "6817d87b4266566bf6a63da0") ? true : false,

          items: [
            {
              title: "Dashboard",
              url: "/dashboard",
              icon: <LayoutDashboardIcon />,
              isAuthenticated: (session.user?.departmentId === "6817d3824266566bf6a63c1e" || session.user?.unitId === "6817d87b4266566bf6a63da0") ? true : false,
            }, 
            {
              title: "Organization Chart",
              url: "/orgchart",
              icon: <UsersIcon />,
              isAuthenticated: (session.user?.departmentId === "6817d3824266566bf6a63c1e" || session.user?.unitId === "6817d87b4266566bf6a63da0") ? true : false,
            },
          ],
        },
      ]);


    
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex justify-center items-center text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <>
        {session && (
          <Appslider
            breadcrumb={
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">RDMC Portal</BreadcrumbLink>
                  </BreadcrumbItem>
                  {/* <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Data Fetching</BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block float-end">
                    <BreadcrumbPage>Page</BreadcrumbPage>
                  </BreadcrumbItem> */}
                </BreadcrumbList>
              </Breadcrumb>
            }
            rightSidebar={
              <div className="flex justify-center items-center gap-2 p-4">
                <Button
                  data-sidebar="logout"
                  data-slot="sidebar-logout"
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                >
                  {/* <PanelLeftIcon /> */}
                  <BellIcon />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>

                <Button
                  data-sidebar="logout"
                  data-slot="sidebar-logout"
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                >
                  {/* <PanelLeftIcon /> */}
                  <LogOutIcon />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>
            }
            userControl={
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                  {/* <GalleryVerticalEnd className="size-4" /> */}
                  <Image
                    src={session.user?.image || "/img/na.jpg"}
                    width={2000}
                    height={2000}
                    alt="User Image"
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold"> {session.user?.name}</span>
                  <span className="">{session.user?.positionEn}</span>
                </div>
              </a>
            }
            appSidebar={navData.map((item) =>  item.isAuthenticated &&  (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium">
                    {item.icon && item.icon} {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
            {item.items.map((item) =>
              item.isAuthenticated && (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton asChild isActive={item.isActive}>
                    <Link href={item.url}>
                      {item.icon && item.icon} {item.title}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            )}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          >
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
              </div> */}
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div>
                  {/* <p>Logged inddd as:</p>
                  <p>
                    <strong>Name:</strong> {session.user?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {session.user?.email}
                  </p>
                  <button onClick={logout}>Logout</button> */}
                  {/* <pre>
                    {JSON.stringify(session, null, 2)}
                  </pre> */}
                  {children}
                </div>
              </div>
            </div>
            {/* <pre>

             {JSON.stringify(session, null, 2)}
           </pre> */}
          </Appslider>
        )}

        {/* {
  "user": {
    "name": "Broker Agent",
    "email": "developer@innovosprint.com",
    "image": "https://lh3.googleusercontent.com/a/ACg8ocKERVqoWCox9i8hQuPrkPHhw6hOo4tUrCwupJdc5Ap1-UaQuQ=s96-c",
    "id": "103792264843457816645",
    "position": "Sales Manager",
    "provider": "google"
  },
  "expires": "2025-05-31T09:27:03.598Z"
} */}
      </>
    );
  }

  return null;
}
