import { useIsMobile } from "@/hooks/use-mobile";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { SidebarContextProps, SidebarState } from "../types";

const SidebarContext = createContext<SidebarContextProps | undefined>(
	undefined,
);

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}

interface SidebarProviderProps {
	children: React.ReactNode;
	defaultState?: SidebarState;
}

export function SidebarProvider({
	children,
	defaultState = "expanded",
}: SidebarProviderProps) {
	const initializedRef = useRef(false);
	const isMobile = useIsMobile();

	// Initialize state with potentially saved value from localStorage
	const getInitialState = (): SidebarState => {
		if (typeof window === "undefined") {
			return defaultState;
		}

		// On mobile, always start with the sidebar collapsed
		if (isMobile) {
			return "collapsed";
		}

		const savedState = localStorage.getItem(
			"sidebarState",
		) as SidebarState | null;
		return savedState || defaultState;
	};

	const [state, setState] = useState<SidebarState>(getInitialState);
	const [isOpen, setIsOpen] = useState(false);

	// Marks as init after the first render...
	useEffect(() => {
		initializedRef.current = true;
	}, []);

	// Save state to localStorage when it changes (desktop only)
	useEffect(() => {
		// Only save after having initialization
		if (!isMobile && initializedRef.current) {
			localStorage.setItem("sidebarState", state);
		}
	}, [state, isMobile]);

	useEffect(() => {
		if (!isMobile) {
			setIsOpen(false);
		}
	}, [isMobile]);

	const toggleSidebar = () => {
		if (isMobile) {
			setIsOpen(!isOpen);
		} else {
			setState(state === "expanded" ? "collapsed" : "expanded");
		}
	};

	const closeSidebar = () => {
		if (isMobile) {
			setIsOpen(false);
		}
	};

	const openSidebar = () => {
		if (isMobile) {
			setIsOpen(true);
		}
	};

	return (
		<SidebarContext.Provider
			value={{
				state,
				isMobile,
				isOpen,
				toggleSidebar,
				closeSidebar,
				openSidebar,
			}}
		>
			{children}
		</SidebarContext.Provider>
	);
}
