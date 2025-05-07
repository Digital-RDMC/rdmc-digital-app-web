import { AppSidebar } from "@/components/app-sidebar";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page({
  children,
  breadcrumb,
  rightSidebar,
  appSidebar,
  userControl,
}: {
  children?: React.ReactNode;
  appSidebar?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  userControl?: React.ReactNode;
}) {
  // const appSidebar = {
  return (
    <SidebarProvider>
      <AppSidebar userContorl={userControl}>{appSidebar}</AppSidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b sticky top-0 z-20 bg-background w-full">
          <div className="flex items-center gap-2 px-3 w-full">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumb}
          
          </div>
          {rightSidebar}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
