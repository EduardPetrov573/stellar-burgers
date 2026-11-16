import { OrderCard } from '@components';
import { clsx } from 'clsx';

import type { OrdersListUIProps } from './type';

import styles from './orders-list.module.css';

export const OrdersListUI = ({ orderByDate }: OrdersListUIProps): React.JSX.Element => (
  <div className={clsx(styles.content)}>
    {!orderByDate.length && (
      <p className="p-6 text text_type_main-default text_color_inactive">
        Заказов пока нет
      </p>
    )}
    {orderByDate.map((order) => (
      <OrderCard order={order} key={order._id} />
    ))}
  </div>
);
