import { useEffect, useRef, useCallback } from 'react';

interface UseAntiCheatProps {
  isActive: boolean;
  onWarning: () => void;
  warningCount: number;
}

const useAntiCheat = ({ isActive, onWarning, warningCount }: UseAntiCheatProps) => {
  const lastViolationTime = useRef<number>(0);
  const cooldownMs = 1000; // Prevent multiple warnings in quick succession

  const handleViolation = useCallback(() => {
    const now = Date.now();
    if (now - lastViolationTime.current < cooldownMs) return;
    lastViolationTime.current = now;
    onWarning();
  }, [onWarning]);

  useEffect(() => {
    if (!isActive) return;

    // Visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation();
      }
    };

    // Window blur (minimize, switch app)
    const handleBlur = () => {
      handleViolation();
    };

    // Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive) {
        // Don't trigger warning for fullscreen exit, just re-enter
      }
    };

    // Block context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block certain keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        handleViolation();
        return;
      }
      // Block Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        handleViolation();
        return;
      }
      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        handleViolation();
        return;
      }
      // Block Ctrl+U (View source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return;
      }
      // Block backspace navigation (only when not in input)
      if (e.key === 'Backspace' && !(e.target as HTMLElement).matches('input, textarea')) {
        e.preventDefault();
      }
    };

    // Block back/forward navigation
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    // Block beforeunload (refresh/close)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Push initial state
    window.history.pushState(null, '', window.location.href);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // DevTools detection via debugger timing
    let devtoolsCheckInterval: number;
    const checkDevTools = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        handleViolation();
      }
    };
    // Commented out to avoid issues, can be enabled if needed
    // devtoolsCheckInterval = window.setInterval(checkDevTools, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (devtoolsCheckInterval) clearInterval(devtoolsCheckInterval);
    };
  }, [isActive, handleViolation]);
};

export default useAntiCheat;
