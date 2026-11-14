import { fetchIngredients, selectIngredientsState } from '@slices/ingredients';
import { Preloader } from '@ui';
import { clsx } from 'clsx';

import { useDispatch, useSelector } from '@services/store';

import { RequestError } from './request-error';

import type { ReactNode } from 'react';

import styles from './ingredients-boundary.module.css';

export const IngredientsBoundary = ({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element => {
  const { items, loaded, isLoading, error } = useSelector(selectIngredientsState);
  const dispatch = useDispatch();
  if (!loaded && (isLoading || !error)) return <Preloader />;
  if (error && !items.length)
    return (
      <RequestError
        message={error}
        retry={() => {
          void dispatch(fetchIngredients());
        }}
      />
    );
  if (!items.length)
    return (
      <p className={clsx(styles.message, 'text text_type_main-default')}>
        Нет ингредиентов
      </p>
    );
  return <>{children}</>;
};
