import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const user = {
  name: "Nicklas Astorian",
  email: "nickastorian@gmail.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AppSidebar() {

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

