"use client";

import { useState, useEffect } from 'react';

/**
 * A hook that calculates bottom padding to prevent the on-screen keyboard
 * from covering UI elements on mobile devices. It only works in browsers
 * that support the Visual Viewport API.
 * @returns {number} The padding to apply to the bottom of the screen.
 */
export function useKeyboardPadding() {
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const visualViewport = window.visualViewport;

    const handleResize = () => {
      const vh = visualViewport.height;
      const wh = window.innerHeight;
      
      // If the visual viewport is significantly smaller than the window height,
      // it's likely the keyboard is open.
      const isKeyboardOpen = (wh - vh) > 150; 

      if (isKeyboardOpen) {
        // The padding is the difference between the window height and the visual viewport height.
        const padding = wh - vh;
        setKeyboardPadding(padding);
      } else {
        setKeyboardPadding(0);
      }
    };

    visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardPadding;
}
