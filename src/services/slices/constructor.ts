import { createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const initialState: TConstructorState = { bun: null, ingredients: [] };
const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      prepare: (ingredient: TIngredient): { payload: TConstructorIngredient } => ({
        payload: { ...ingredient, id: nanoid() },
      }),
      reducer: (state, { payload }: PayloadAction<TConstructorIngredient>) => {
        if (payload.type === 'bun') state.bun = payload;
        else state.ingredients.push(payload);
      },
    },
    removeIngredient: (state, { payload }: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== payload);
    },
    moveIngredient: (
      state,
      { payload }: PayloadAction<{ from: number; to: number }>
    ) => {
      if (
        payload.from < 0 ||
        payload.to < 0 ||
        payload.from >= state.ingredients.length ||
        payload.to >= state.ingredients.length
      )
        return;
      const [item] = state.ingredients.splice(payload.from, 1);
      state.ingredients.splice(payload.to, 0, item);
    },
    clearConstructor: () => initialState,
  },
  selectors: { selectConstructor: (state) => state },
});
export const { addIngredient, removeIngredient, moveIngredient, clearConstructor } =
  constructorSlice.actions;
export const { selectConstructor } = constructorSlice.selectors;
export default constructorSlice.reducer;
