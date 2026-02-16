import { useState, useCallback } from "react";

export type Screen =
  | { name: "calendar" }
  | { name: "recording"; eventId?: string }
  | { name: "pipeline" }
  | { name: "deal-detail"; dealId: number }
  | { name: "contacts" }
  | { name: "contact-detail"; contactId: number }
  | { name: "settings" };

export interface Router {
  current: Screen;
  history: Screen[];
  navigate: (screen: Screen) => void;
  goBack: () => void;
  canGoBack: boolean;
}

export function useRouter(initial: Screen = { name: "calendar" }): Router {
  const [current, setCurrent] = useState<Screen>(initial);
  const [history, setHistory] = useState<Screen[]>([]);

  const navigate = useCallback(
    (screen: Screen) => {
      setHistory((prev) => [...prev, current]);
      setCurrent(screen);
    },
    [current]
  );

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const previous = newHistory.pop()!;
      setCurrent(previous);
      return newHistory;
    });
  }, []);

  return {
    current,
    history,
    navigate,
    goBack,
    canGoBack: history.length > 0,
  };
}
