import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Function to handle scroll events
    const toggleVisibility = () => {
      // Check both window scroll and main container scroll
      const windowScroll = window.pageYOffset || document.documentElement.scrollTop;
      const mainContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
      const containerScroll = mainContainer?.scrollTop || 0;
      
      // Show button if scrolled more than 300px in either window or container
      if (windowScroll > 300 || containerScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Listen to both window scroll and main container scroll
    window.addEventListener('scroll', toggleVisibility);
    
    const mainContainer = document.querySelector('main.overflow-y-auto');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', toggleVisibility);
    }

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (mainContainer) {
        mainContainer.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, []);

  const scrollToTop = () => {
    // Scroll both window and main container to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    const mainContainer = document.querySelector('main.overflow-y-auto') as HTMLElement;
    if (mainContainer) {
      mainContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    
    // Also scroll any other scrollable containers
    const scrollableDivs = document.querySelectorAll('.overflow-y-auto');
    scrollableDivs.forEach((div) => {
      (div as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
