import React, { createContext, useContext, useState, useCallback } from 'react';

type Route = {
  screen: string;
  params?: Record<string, any>;
};

type NavigationContextType = {
  navigate: (screen: string, params?: Record<string, any>) => void;
  goBack: () => void;
  setTab: (index: number) => void;
  currentTab: number;
  stack: Route[];
  params: Record<string, any>;
};

const NavigationContext = createContext<NavigationContextType>({
  navigate: () => {},
  goBack: () => {},
  setTab: () => {},
  currentTab: 0,
  stack: [],
  params: {},
});

const TAB_SCREENS = ['home', 'create', 'library', 'settings'];

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [stack, setStack] = useState<Route[]>([]);

  const navigate = useCallback((screen: string, params?: Record<string, any>) => {
    const tabIndex = TAB_SCREENS.indexOf(screen);
    if (tabIndex >= 0) {
      setCurrentTab(tabIndex);
      setStack([]);
    } else {
      setStack((prev) => [...prev, { screen, params }]);
    }
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const setTab = useCallback((index: number) => {
    setCurrentTab(index);
    setStack([]);
  }, []);

  const topRoute = stack[stack.length - 1];
  const params = topRoute?.params || {};

  return (
    <NavigationContext.Provider value={{ navigate, goBack, setTab, currentTab, stack, params }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
