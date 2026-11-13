import { fetchIngredients, selectIngredientsState } from '@slices/ingredients';
import { Preloader } from '@ui';

import { useDispatch, useSelector } from '@services/store';

import { RequestError } from './request-error';

import type { ReactNode } from 'react';

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
      <p className="request-message text text_type_main-default">Нет ингредиентов</p>
    );
  return <>{children}</>;
};
