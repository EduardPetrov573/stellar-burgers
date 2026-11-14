import { clearUserError, selectUserState, updateUser } from '@slices/user';
import { ProfileUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';
import type { ChangeEvent, SyntheticEvent } from 'react';

export const Profile = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const { user, error, isLoading } = useSelector(selectUserState);
  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);
  useEffect(() => {
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!user || isLoading || !isFormChanged) return;
    const changes: Partial<TRegisterData> = {};
    if (formValue.name !== user.name) changes.name = formValue.name;
    if (formValue.email !== user.email) changes.email = formValue.email;
    if (formValue.password) changes.password = formValue.password;
    void dispatch(updateUser(changes));
  };
  const handleCancel = (event: SyntheticEvent): void => {
    event.preventDefault();
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
    dispatch(clearUserError());
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormValue((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };
  if (!user) return null;
  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      isLoading={isLoading}
      updateUserError={error ?? undefined}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
