import { selectIngredients } from '@slices/ingredients';
import { IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { useSelector } from '@services/store';

import { RequestError } from '../request-error';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams();
  const ingredients = useSelector(selectIngredients);
  const ingredient = ingredients.find((item) => item._id === id);
  if (!ingredient) return <RequestError message="Ингредиент не найден" />;
  return <IngredientDetailsUI ingredientData={ingredient} />;
};
