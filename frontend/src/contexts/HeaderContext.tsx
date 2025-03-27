import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// Simple state: just the current title and actions nodes
interface HeaderState {
  title: ReactNode | null; // Allow ReactNode for flexibility if needed, but string is often fine
  actions: ReactNode | null;
}

interface HeaderContextProps extends HeaderState {
  // Stable setters are key
  setTitle: (title: ReactNode | null) => void;
  setActions: (actions: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [headerState, setHeaderState] = useState<HeaderState>({
    title: null, // Start empty
    actions: null,
  });

  // Use useCallback to ensure setters have stable references
  const setTitle = useCallback((title: ReactNode | null) => {
    // Optional: Prevent update if value is identical (reference check for nodes)
    setHeaderState((
      prev,
    ) => (prev.title === title ? prev : { ...prev, title }));
  }, []);

  const setActions = useCallback((actions: ReactNode | null) => {
    setHeaderState((
      prev,
    ) => (prev.actions === actions ? prev : { ...prev, actions }));
  }, []);

  // Memoize the context value based on state and stable setters
  const value = useMemo(
    () => ({
      ...headerState,
      setTitle,
      setActions,
    }),
    [headerState.title, headerState.actions, setTitle, setActions],
  );

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  );
};

// Standard consumer hook
export const useHeader = (): HeaderContextProps => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
};
