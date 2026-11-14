import { logout, selectUserState } from '@slices/user';
import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import { RequestError } from '../request-error';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(selectUserState);

  const handleLogout = (): void => {
    if (isLoading) return;
    void dispatch(logout())
      .unwrap()
      .then(() => {
        void navigate('/login', { replace: true });
      })
      .catch(() => {
        /* The error remains visible. */
      });
  };

  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />
      {error && <RequestError message={error} />}
    </>
  );
};
