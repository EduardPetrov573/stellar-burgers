import { clearUserError, resetPassword, selectUserState } from '@slices/user';
import { ResetPasswordUI } from '@ui-pages';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const ResetPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isLoading } = useSelector(selectUserState);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [canReset] = useState(() => !!sessionStorage.getItem('resetPassword'));
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (isLoading) return;
    void dispatch(resetPassword({ password, token }))
      .unwrap()
      .then(() => {
        void navigate('/login', { replace: true });
      })
      .catch(() => {
        /* The slice exposes the error to the form. */
      });
  };
  if (!canReset) return <Navigate to="/forgot-password" replace />;
  return (
    <ResetPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
