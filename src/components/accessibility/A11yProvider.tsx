import React, { createContext, useContext, useEffect, useState } from 'react';

interface A11yPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  focusVisible: boolean;
}

interface A11yContextValue {
  preferences: A11yPreferences;
  updatePreferences: (preferences: Partial<A11yPreferences>) => void;
  announceMessage: (message: string) => void;
}

const A11yContext = createContext<A11yContextValue | undefined>(undefined);

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};

interface A11yProviderProps {
  children: React.ReactNode;
}

export const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<A11yPreferences>({
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium',
    focusVisible: true
  });

  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('a11y-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse accessibility preferences:', error);
      }
    }

    // Detect system preferences
    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)')
    };

    const updateSystemPreferences = () => {
      setPreferences(prev => ({
        ...prev,
        reduceMotion: mediaQueries.reduceMotion.matches,
        highContrast: mediaQueries.highContrast.matches
      }));
    };

    updateSystemPreferences();

    // Listen for system preference changes
    mediaQueries.reduceMotion.addListener(updateSystemPreferences);
    mediaQueries.highContrast.addListener(updateSystemPreferences);

    return () => {
      mediaQueries.reduceMotion.removeListener(updateSystemPreferences);
      mediaQueries.highContrast.removeListener(updateSystemPreferences);
    };
  }, []);

  useEffect(() => {
    // Apply CSS classes based on preferences
    const root = document.documentElement;
    
    // Remove existing classes
    root.classList.remove('reduce-motion', 'high-contrast', 'font-small', 'font-large', 'focus-visible');
    
    // Add current preference classes
    if (preferences.reduceMotion) root.classList.add('reduce-motion');
    if (preferences.highContrast) root.classList.add('high-contrast');
    if (preferences.fontSize === 'small') root.classList.add('font-small');
    if (preferences.fontSize === 'large') root.classList.add('font-large');
    if (preferences.focusVisible) root.classList.add('focus-visible');

    // Save to localStorage
    localStorage.setItem('a11y-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<A11yPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const announceMessage = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Remove after announcement is made
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 1000);
  };

  return (
    <A11yContext.Provider value={{ preferences, updatePreferences, announceMessage }}>
      {children}
      
      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
    </A11yContext.Provider>
  );
};

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Focus trap component for modals
interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, active }) => {
  const trapRef = React.useRef<HTMLDivElement>(null);
  const previousFocus = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousFocus.current = document.activeElement as HTMLElement;

    const trap = trapRef.current;
    if (!trap) return;

    // Get all focusable elements within the trap
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      
      return Array.from(trap.querySelectorAll(selector));
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // Restore focus to the previously focused element
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [active]);

  return <div ref={trapRef}>{children}</div>;
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: string[],
  onSelect: (item: string, index: number) => void
) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0) {
          e.preventDefault();
          onSelect(items[activeIndex], activeIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setActiveIndex(-1);
        break;
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      'aria-selected': index === activeIndex,
      tabIndex: index === activeIndex ? 0 : -1,
      onMouseEnter: () => setActiveIndex(index)
    })
  };
};

export default A11yProvider;