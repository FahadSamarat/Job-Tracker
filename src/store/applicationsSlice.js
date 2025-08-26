import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  applications: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.lastFetched = Date.now();
      state.error = null;
    },
    addApplication: (state, action) => {
      state.applications.push(action.payload);
    },
    updateApplication: (state, action) => {
      const index = state.applications.findIndex(
        (app) => app.id === action.payload.id
      );
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    deleteApplication: (state, action) => {
      state.applications = state.applications.filter(
        (app) => app.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearApplications: (state) => {
      state.applications = [];
      state.lastFetched = null;
    },
  },
});

export const {
  setApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  setLoading,
  setError,
  clearError,
  clearApplications,
} = applicationsSlice.actions;

export default applicationsSlice.reducer;
