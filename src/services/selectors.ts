import { createSelector } from '@reduxjs/toolkit';

import { selectConstructor } from './slices/constructor';

const BUN_HALVES = 2;
export const selectConstructorPrice = createSelector(
  selectConstructor,
  ({ bun, ingredients }) =>
    (bun ? bun.price * BUN_HALVES : 0) +
    ingredients.reduce((total, ingredient) => total + ingredient.price, 0)
);
export const selectIngredientCounts = createSelector(
  selectConstructor,
  ({ bun, ingredients }) => {
    const counts: Record<string, number> = {};
    for (const ingredient of ingredients)
      counts[ingredient._id] = (counts[ingredient._id] ?? 0) + 1;
    if (bun) counts[bun._id] = BUN_HALVES;
    return counts;
  }
);
