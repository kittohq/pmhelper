import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ProjectSidebar } from "./ProjectSidebar";
import { ChatSidebar } from "./ChatSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      <ProjectSidebar />
      
      {/* Floating trigger button - only visible when sidebar is collapsed */}
      {!open && (
        <SidebarTrigger className="fixed top-4 left-4 z-50 bg-sidebar-accent text-sidebar-accent-foreground shadow-lg border border-sidebar-border hover:bg-sidebar-accent/80" />
      )}
      
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
        
        <ChatSidebar />
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  );
}