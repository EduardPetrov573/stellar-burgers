import { OrderInfo } from '@components';
import { clsx } from 'clsx';
import { useParams } from 'react-router-dom';

import { IngredientsBoundary } from '@components/ingredients-boundary';

import styles from '../details.module.css';

export const OrderPage = (): React.JSX.Element => {
  const { number } = useParams();
  return (
    <main className={styles.container}>
      <h1 className={clsx(styles.title, 'text text_type_digits-default')}>#{number}</h1>
      <IngredientsBoundary>
        <OrderInfo />
      </IngredientsBoundary>
    </main>
  );
};
