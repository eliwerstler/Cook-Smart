import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [delay]);

  const getTransformClass = () => {
    switch (direction) {
      case 'up':
        return isVisible ? 'translate-y-0' : 'translate-y-4';
      case 'down':
        return isVisible ? 'translate-y-0' : '-translate-y-4';
      case 'left':
        return isVisible ? 'translate-x-0' : 'translate-x-4';
      case 'right':
        return isVisible ? 'translate-x-0' : '-translate-x-4';
      default:
        return isVisible ? 'translate-y-0' : 'translate-y-4';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-${duration} transform ${getTransformClass()} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
