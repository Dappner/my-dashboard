import { useHeader } from "@/contexts/HeaderContext";
import { useEffect } from "react";
import type { ReactNode } from "react"; // Import ReactNode type

// Simple hook to set/clear header content on mount/unmount
export const useSetHeader = (
  title: ReactNode | null, // Can be string or node
  actions: ReactNode | null = null,
) => {
  // Get stable setters from context
  const { setTitle, setActions } = useHeader();

  // Effect 1: Set title/actions when component mounts OR when
  // the title/actions props passed to *this hook* actually change.
  // RELIES HEAVILY ON STABLE PROPS being passed in.
  useEffect(() => {
    setTitle(title);
    setActions(actions);

    // Log for debugging (optional)
    // console.log("useSetHeader SET:", { title, actions });

    // NO cleanup here - separate effect for that
  }, [title, actions, setTitle, setActions]); // Dependencies are the props and stable setters

  // Effect 2: Cleanup on unmount ONLY
  useEffect(() => {
    // This function runs ONLY when the component using the hook unmounts
    return () => {
      // Reset the header state
      // Optional: Could check if the current context values match 'title'/'actions'
      // before clearing, but usually just clearing is fine.
      setTitle(null); // Reset to null or default
      setActions(null);
      // console.log("useSetHeader CLEARED");
    };
    // Depend only on stable setters to ensure this runs just once for cleanup
  }, [setTitle, setActions]);
};
