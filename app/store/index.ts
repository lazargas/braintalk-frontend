import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import authReducer from './slices/authSlice';
import promptReducer from './slices/promptSlice';
import voiceReducer from './slices/voiceSlice';
import historyReducer from './slices/historySlice';
import createStorage from '../utils/createStorage';

// Use our custom storage implementation
const storage = createStorage();

// Configuration for redux-persist
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token'], // only persist user and token
  version: 1 // Add version to help with migrations
};

// Configuration for history persistence
const historyPersistConfig = {
  key: 'history',
  storage,
  whitelist: ['items', 'pagination'], // persist items and pagination
  version: 1
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedHistoryReducer = persistReducer(historyPersistConfig, historyReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    prompt: promptReducer,
    voice: voiceReducer,
    history: persistedHistoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.token', 'history.items'],
      },
    }),
});

// Only create the persistor in the browser
export const persistor = typeof window !== 'undefined' ? persistStore(store) : null;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;