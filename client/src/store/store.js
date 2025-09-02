import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import applicationsReducer from "./applicationsSlice";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["applications"], // only applications will be persisted
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, applicationsReducer);

// Configure store
export const store = configureStore({
  reducer: {
    applications: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
