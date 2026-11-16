import { IngredientDetails } from '@components';
import { clsx } from 'clsx';

import { IngredientsBoundary } from '@components/ingredients-boundary';

import styles from '../details.module.css';

export const IngredientPage = (): React.JSX.Element => (
  <main className={styles.container}>
    <h1 className={clsx(styles.title, 'text text_type_main-large')}>
      Детали ингредиента
    </h1>
    <IngredientsBoundary>
      <IngredientDetails />
    </IngredientsBoundary>
  </main>
);
