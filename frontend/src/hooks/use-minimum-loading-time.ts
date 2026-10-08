import { useEffect, useRef, useState } from "react";

export function useMinimumLoadingTime(
  isLoading: boolean,
  minimumDuration = 1200,
): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const visibleSince = useRef(Date.now());

  useEffect(() => {
    if (isLoading) {
      visibleSince.current = Date.now();
      setIsVisible(true);
      return undefined;
    }

    if (!isVisible) {
      return undefined;
    }

    const elapsed = Date.now() - visibleSince.current;
    const remaining = Math.max(0, minimumDuration - elapsed);
    const timer = setTimeout(() => setIsVisible(false), remaining);

    return () => clearTimeout(timer);
  }, [isLoading, isVisible, minimumDuration]);

  return isVisible;
}
