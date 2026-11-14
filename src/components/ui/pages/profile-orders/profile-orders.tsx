import { ProfileMenu, OrdersList } from '@components';
import { clsx } from 'clsx';

import type { ProfileOrdersUIProps } from './type';

import styles from './profile-orders.module.css';

export const ProfileOrdersUI = ({ orders }: ProfileOrdersUIProps): React.JSX.Element => (
  <main className={clsx(styles.main)}>
    <div className={clsx('mt-30 mr-15', styles.menu)}>
      <ProfileMenu />
    </div>
    <div className={clsx('mt-10', styles.orders)}>
      <OrdersList orders={orders} />
    </div>
  </main>
);
