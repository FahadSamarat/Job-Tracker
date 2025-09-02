import { useDispatch, useSelector } from "react-redux";
import {
  setApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  setLoading,
  setError,
} from "../store/applicationsSlice";

export const useApplications = () => {
  const dispatch = useDispatch();
  const { applications, loading, error, lastFetched } = useSelector(
    (state) => state.applications
  );

  return {
    applications,
    loading,
    error,
    lastFetched,
    setApplications: (apps) => dispatch(setApplications(apps)),
    addApplication: (app) => dispatch(addApplication(app)),
    updateApplication: (app) => dispatch(updateApplication(app)),
    deleteApplication: (id) => dispatch(deleteApplication(id)),
    setLoading: (isLoading) => dispatch(setLoading(isLoading)),
    setError: (error) => dispatch(setError(error)),
  };
};
