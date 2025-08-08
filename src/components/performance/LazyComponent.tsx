import React, { useState, useEffect, useRef, type ReactNode } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(currentRef);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, triggerOnce, hasTriggered]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazyComponent;