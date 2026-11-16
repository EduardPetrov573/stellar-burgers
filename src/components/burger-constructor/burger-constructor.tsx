import { selectConstructor } from '@slices/constructor';
import { clearCreatedOrder, createOrder, selectOrders } from '@slices/orders';
import { selectUser } from '@slices/user';
import { BurgerConstructorUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectConstructorPrice } from '@services/selectors';
import { useDispatch, useSelector } from '@services/store';

import { RequestError } from '../request-error';

import styles from './burger-constructor.module.css';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const constructorItems = useSelector(selectConstructor);
  const { submitting, created, submitError } = useSelector(selectOrders);
  const price = useSelector(selectConstructorPrice);

  const onOrderClick = (): void => {
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    if (!constructorItems.bun || submitting) return;
    const bunId = constructorItems.bun._id;
    const ids = [bunId, ...constructorItems.ingredients.map((item) => item._id), bunId];
    void dispatch(createOrder(ids));
  };
  const closeOrderModal = (): void => {
    if (!submitting) dispatch(clearCreatedOrder());
  };

  return (
    <div className={styles.column}>
      <BurgerConstructorUI
        price={price}
        orderRequest={submitting}
        constructorItems={constructorItems}
        orderModalData={created}
        onOrderClick={onOrderClick}
        closeOrderModal={closeOrderModal}
      />
      {submitError && <RequestError message={submitError} retry={onOrderClick} />}
    </div>
  );
};
