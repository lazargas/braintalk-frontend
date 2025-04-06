// Custom storage for Redux Persist that works with SSR
const createStorage = () => {
  // For SSR, return a dummy storage
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
  
  // For client-side, use localStorage with Promise wrappers
  return {
    getItem: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        return Promise.resolve(item);
      } catch (e) {
        console.error('Error getting localStorage item:', e);
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch (e) {
        console.error('Error setting localStorage item:', e);
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch (e) {
        console.error('Error removing localStorage item:', e);
        return Promise.resolve();
      }
    },
  };
};

export default createStorage;