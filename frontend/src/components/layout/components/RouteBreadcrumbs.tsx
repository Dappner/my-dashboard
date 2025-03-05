import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router";

type BreadcrumbRoute = {
  path: string;
  label: string;
  parent?: string;
};

// Create a mapping of routes to breadcrumb labels
const routeMap: Record<string, BreadcrumbRoute> = {
  "/": { path: "/", label: "Home" },
};

export default function RouteBreadcrumbs() {
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Handle exact matches first
    if (routeMap[location.pathname]) {
      const items: BreadcrumbRoute[] = [];
      let currentPath = routeMap[location.pathname];

      // Add current path
      items.unshift(currentPath);

      // Add parent paths
      while (currentPath.parent && routeMap[currentPath.parent]) {
        currentPath = routeMap[currentPath.parent];
        items.unshift(currentPath);
      }

      return items;
    }

    // Handle dynamic routes with parameters
    const dynamicItems: BreadcrumbRoute[] = [];
    let currentPath = "/";
    dynamicItems.push(routeMap[currentPath]);

    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += (i === 0 ? "" : "/") + pathSegments[i];

      // Check for exact match
      if (routeMap[currentPath]) {
        dynamicItems.push(routeMap[currentPath]);
        continue;
      }

      // Check for pattern match (like '/users/:id')
      const patternKey = Object.keys(routeMap).find(pattern => {
        const patternSegments = pattern.split('/').filter(Boolean);
        if (patternSegments.length !== i + 1) return false;

        for (let j = 0; j < patternSegments.length; j++) {
          if (patternSegments[j].startsWith(':')) continue;
          if (patternSegments[j] !== pathSegments[j]) return false;
        }

        return true;
      });

      if (patternKey) {
        // Replace parameter placeholder with actual value
        const routeInfo = { ...routeMap[patternKey] };
        if (routeInfo.label.includes('Details')) {
          routeInfo.label = pathSegments[i];
        }
        dynamicItems.push(routeInfo);
      } else {
        // Fallback - just capitalize the path segment
        dynamicItems.push({
          path: currentPath,
          label: pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1)
        });
      }
    }

    return dynamicItems;
  }, [location.pathname]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.path}>
                {index > 0 && (
                  <li className="hidden md:block">
                    <span className="mx-2 text-muted-foreground">/</span>
                  </li>
                )}
                <BreadcrumbItem className="hidden md:block">
                  {index === breadcrumbItems.length - 1 ? (
                    // Current Page
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild href={item.path}>
                      <Link to={item.path}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
