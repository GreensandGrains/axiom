
import { useLocation } from "wouter";
import { useNavigation } from "@/contexts/navigation-context";

export const useCustomNavigation = () => {
  const [, navigate] = useLocation();
  const { setIsLoading } = useNavigation();

  const navigateWithLoading = (path: string, delay: number = 100) => {
    setIsLoading(true);
    
    setTimeout(() => {
      navigate(path);
    }, delay);
  };

  return {
    navigate: navigateWithLoading,
    navigateImmediate: navigate,
  };
};
