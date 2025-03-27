import React, {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

interface HeaderState {
  title: string | null;
  actions: ReactNode | null;
}

interface HeaderContextProps extends HeaderState {
  setTitle: (title: string | null) => void; // Allow setting null
  setActions: (actions: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = (
  { children },
) => {
  const [headerState, setHeaderState] = useState<HeaderState>({
    // *** Start with null title ***
    title: null,
    actions: null,
  });

  // Allow setting null title
  const setTitle = (title: string | null) => {
    setHeaderState((prev) => ({ ...prev, title }));
  };

  const setActions = (actions: ReactNode | null) => {
    setHeaderState((prev) => ({ ...prev, actions }));
  };

  const value = useMemo(() => ({
    ...headerState,
    setTitle,
    setActions,
  }), [headerState.title, headerState.actions]);

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = (): HeaderContextProps => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
};

// Hook to set header state from components
// Sets title/actions on mount and clears on unmount
export const useSetHeader = (
  title: string | null,
  actions: ReactNode | null = null,
) => {
  const { setTitle, setActions } = useHeader();

  useLayoutEffect(() => {
    setTitle(title); // Set the provided title (can be null)
    setActions(actions);

    // Cleanup function
    return () => {
      // Reset actions when component unmounts
      setActions(null);
      // Optionally reset title back to null if desired,
      // otherwise the last static title might show briefly.
      // Resetting might cause a flicker if the next page loads slowly.
      // setTitle(null);
    };
    // Depend on the reference of actions, but only primitive title
  }, [title, actions, setTitle, setActions]);
};
