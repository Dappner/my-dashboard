import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef } from "react";

export function AppSidebar() {
  const { isMobile, state, toggleSidebar } = useSidebar();

  const hasLoaded = useRef(false);

  // Loads State from Sidebar
  useEffect(() => {
    if (!isMobile && !hasLoaded.current) {
      const savedState = localStorage.getItem("sidebarState") as
        | "expanded"
        | "collapsed"
        | null;
      if (savedState && savedState !== state) {
        toggleSidebar();
      }
      hasLoaded.current = true;
    }
  }, [isMobile, toggleSidebar, state]); // Dependencies included but effect only runs once

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!isMobile && hasLoaded.current) {
      localStorage.setItem("sidebarState", state);
    }
  }, [state, isMobile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <Link to="/investing/alerts" className="flex justify-center w-full">
          <Button
            variant="ghost"
            className={`w-full justify-start ${state === "collapsed" && !isMobile ? "size-10 p-0" : ""
              }`}
          >
            <Bell className="size-5" />
            <span
              className={`${state === "collapsed" && !isMobile ? "hidden" : "ml-2"
                } truncate font-semibold`}
            >
              Alerts
            </span>
          </Button>
        </Link>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
