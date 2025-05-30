
import React, { ReactNode, useEffect, useState } from 'react';

interface MotionProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export const motion = {
  div: ({ children, className = '', ...props }: MotionProps) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
      setIsVisible(true);
    }, []);
    
    return (
      <div
        className={`${className} ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
        {...props}
      >
        {children}
      </div>
    );
  }
};
