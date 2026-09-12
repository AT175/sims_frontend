// Web stub for @react-native-async-storage/async-storage
// The web build uses IndexedDB (via idb) instead; this stub satisfies
// the Vite dependency scanner for the native-only require() call.
export default {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  getAllKeys: async () => [],
  multiGet: async () => [],
  multiSet: async () => {},
  multiRemove: async () => {},
  clear: async () => {},
  flushGetRequests: () => {},
};
