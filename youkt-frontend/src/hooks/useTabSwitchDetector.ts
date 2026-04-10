import { useEffect, useRef, useCallback } from "react";

interface TabSwitchCallback {
  onTabSwitch: () => void;
}

export function useTabSwitchDetector({ onTabSwitch }: TabSwitchCallback) {
  const wasHiddenRef = useRef(false);

  useEffect(() => {
    // Set initial state
    wasHiddenRef.current = document.hidden;

    const handleVisibilityChange = () => {
      // If document becomes hidden (tab switched away)
      if (document.hidden && !wasHiddenRef.current) {
        wasHiddenRef.current = true;
        onTabSwitch();
      }
      
      // If document becomes visible again (tab switched back)
      if (!document.hidden && wasHiddenRef.current) {
        wasHiddenRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onTabSwitch]);
}
