import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, register, logout } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  return {
    user,
    token,
    isLoading,
    error,
    login: (credentials: { email: string; password: string }) => 
      dispatch(login(credentials)),
    register: (userData: { email: string; password: string }) => 
      dispatch(register(userData)),
    logout: () => dispatch(logout()),
  };
}