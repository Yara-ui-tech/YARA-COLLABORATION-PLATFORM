import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Basic network checker for mobile React Native app
    const checkNetwork = async () => {
      try {
        const response = await fetch('https://www.google.com/generate_204', { method: 'HEAD' });
        setIsOnline(response.ok || response.status === 204);
      } catch {
        setIsOnline(false);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 10000);
    return () => clearInterval(interval);
  }, []);

  return isOnline;
}
