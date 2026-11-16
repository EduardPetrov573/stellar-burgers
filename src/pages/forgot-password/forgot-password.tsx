import { clearUserError, forgotPassword, selectUserState } from '@slices/user';
import { ForgotPasswordUI } from '@ui-pages';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const ForgotPassword = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isLoading } = useSelector(selectUserState);
  const [email, setEmail] = useState('');
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (isLoading) return;
    void dispatch(forgotPassword(email))
      .unwrap()
      .then(() => {
        void navigate('/reset-password', { replace: true });
      })
      .catch(() => {
        /* The slice exposes the error to the form. */
      });
  };
  return (
    <ForgotPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
