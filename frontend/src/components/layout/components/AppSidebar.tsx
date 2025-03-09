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

export function AppSidebar() {
  const { isMobile, state } = useSidebar();

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
            {/* Always show "Alerts" unless explicitly hidden */}
            <span
              className={`${state === "collapsed" && !isMobile ? "hidden" : "ml-2"
                } truncate font-semibold`}
            >
              Alerts
            </span>
          </Button>
        </Link>        <NavUser />
      </SidebarFooter>
    </Sidebar >
  )
}

