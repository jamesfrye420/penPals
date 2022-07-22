import { useEffect, useState } from 'react';

export default function useIsServer() {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => {
    setIsServer(false);
    return () => {
      setIsServer(true);
    };
  }, []);

  return isServer;
}
