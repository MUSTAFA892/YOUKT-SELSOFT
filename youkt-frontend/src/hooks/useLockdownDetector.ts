import { useEffect, useRef, useCallback } from "react";

interface LockdownDetection {
  onTabSwitch: () => void;
  onSplitScreen?: () => void;
}

export function useLockdownDetector({ onTabSwitch, onSplitScreen }: LockdownDetection) {
  const previousFocusRef = useRef(true);
  const detectingRef = useRef(true);
  const lastWindowWidthRef = useRef(window.innerWidth);
  const lastWindowHeightRef = useRef(window.innerHeight);
  const splitScreenDetectedRef = useRef(false);

  useEffect(() => {
    const handleBlur = () => {
      if (previousFocusRef.current) {
        previousFocusRef.current = false;
        onTabSwitch();
      }
    };

    const handleFocus = () => {
      previousFocusRef.current = true;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (previousFocusRef.current) {
          previousFocusRef.current = false;
          onTabSwitch();
        }
      } else {
        previousFocusRef.current = true;
      }
    };

    // Split screen detection - monitor window resize
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const screenWidth = window.screen.width;
      const currentHeight = window.innerHeight;
      const screenHeight = window.screen.height;

      // Check if window is significantly smaller than screen (indicates split screen or resize)
      // Allow 5% tolerance for browser UI
      const isNotFullscreenWidth = currentWidth < screenWidth * 0.95;
      const isNotFullscreenHeight = currentHeight < screenHeight * 0.95;

      if ((isNotFullscreenWidth || isNotFullscreenHeight) && !splitScreenDetectedRef.current) {
        splitScreenDetectedRef.current = true;
        onSplitScreen?.();
      } else if (!isNotFullscreenWidth && !isNotFullscreenHeight) {
        splitScreenDetectedRef.current = false;
      }

      lastWindowWidthRef.current = currentWidth;
      lastWindowHeightRef.current = currentHeight;
    };

    // Block split screen keyboard shortcuts (Windows Snap)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Win+Left, Win+Right, Win+Up, Win+Down
      if ((e.metaKey || e.key === 'Meta') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        onSplitScreen?.();
      }
    };

    // Listen for window blur (user switches to another app/tab)
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    
    // Listen for visibility API changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for window resize (split screen detection)
    window.addEventListener("resize", handleResize);

    // Listen for keyboard shortcuts
    window.addEventListener("keydown", handleKeyDown);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTabSwitch, onSplitScreen]);
}
