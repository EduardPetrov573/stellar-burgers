import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  IngredientPage,
  OrderPage,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { fetchIngredients } from '@slices/ingredients';
import { checkUser } from '@slices/user';
import { useCallback, useEffect } from 'react';
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';

import { useDispatch } from '@services/store';

import { IngredientsBoundary } from '../ingredients-boundary';
import { ProtectedRoute } from '../protected-route';

import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUser());
  }, [dispatch]);
  const location = useLocation();
  const navigate = useNavigate();
  const feedOrderMatch = useMatch('/feed/:number');
  const profileOrderMatch = useMatch('/profile/orders/:number');
  const orderNumber = (feedOrderMatch ?? profileOrderMatch)?.params.number;
  const orderTitle = orderNumber ? `#${orderNumber}` : '';
  const background = (location.state as { background?: Location } | null)?.background;
  const closeModal = useCallback((): void => {
    void navigate(-1);
  }, [navigate]);

  return (
    <div className={styles.app}>
      <Routes location={background ?? location}>
        <Route
          element={
            <>
              <AppHeader />
              <Outlet />
            </>
          }
        >
          <Route
            path="/"
            element={
              <IngredientsBoundary>
                <ConstructorPage />
              </IngredientsBoundary>
            }
          />
          <Route
            path="/feed"
            element={
              <IngredientsBoundary>
                <Feed />
              </IngredientsBoundary>
            }
          />
          <Route path="/ingredients/:id" element={<IngredientPage />} />
          <Route path="/feed/:number" element={<OrderPage />} />
          <Route
            path="/login"
            element={
              <ProtectedRoute onlyGuest>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute onlyGuest>
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute onlyGuest>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute onlyGuest>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute>
                <IngredientsBoundary>
                  <ProfileOrders />
                </IngredientsBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound404 />} />
        </Route>
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={closeModal}>
                <IngredientsBoundary>
                  <IngredientDetails />
                </IngredientsBoundary>
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title={orderTitle} onClose={closeModal}>
                <IngredientsBoundary>
                  <OrderInfo />
                </IngredientsBoundary>
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal title={orderTitle} onClose={closeModal}>
                  <IngredientsBoundary>
                    <OrderInfo />
                  </IngredientsBoundary>
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
