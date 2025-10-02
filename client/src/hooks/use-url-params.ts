
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export function useUrlParams() {
  const [location] = useLocation();
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams(searchParams);
  }, [location]);

  const getParam = (key: string): string | null => {
    return params.get(key);
  };

  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(key, value);
    window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    setParams(newParams);
  };

  const removeParam = (key: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete(key);
    const search = newParams.toString();
    window.history.pushState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
    setParams(newParams);
  };

  return {
    params,
    getParam,
    setParam,
    removeParam,
  };
}
