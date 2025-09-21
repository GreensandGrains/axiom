
import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} - Axiom` : 'Axiom - Discord Server Directory';
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
