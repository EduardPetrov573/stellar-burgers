import { selectUserState } from '@slices/user';
import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { ReactElement } from 'react';
import type { Location } from 'react-router-dom';

type ProtectedRouteProps = { children: ReactElement; onlyGuest?: boolean };
export const ProtectedRoute = ({
  children,
  onlyGuest = false,
}: ProtectedRouteProps): ReactElement => {
  const { user, checked } = useSelector(selectUserState);
  const location = useLocation();
  if (!checked) return <Preloader />;
  if (!onlyGuest && !user)
    return <Navigate to="/login" replace state={{ from: location }} />;
  if (onlyGuest && user) {
    const from = (location.state as { from?: Location } | null)?.from;
    return (
      <Navigate to={from ? from.pathname + from.search + from.hash : '/'} replace />
    );
  }
  return children;
};
