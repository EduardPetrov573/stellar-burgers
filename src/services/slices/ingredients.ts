import { getIngredientsApi } from '@api';
import { createSlice } from '@reduxjs/toolkit';

import { createAppAsyncThunk } from '../create-app-async-thunk';

import type { TIngredient } from '@utils-types';

type IngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
  loaded: boolean;
};
const initialState: IngredientsState = {
  items: [],
  isLoading: false,
  error: null,
  loaded: false,
};
export const fetchIngredients = createAppAsyncThunk(
  'ingredients/fetch',
  getIngredientsApi,
  {
    condition: (_, { getState }) => !getState().ingredients.isLoading,
  }
);
const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
        state.loaded = true;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
  selectors: {
    selectIngredients: (state) => state.items,
    selectIngredientsState: (state) => state,
  },
});
export const { selectIngredients, selectIngredientsState } = ingredientsSlice.selectors;
export default ingredientsSlice.reducer;
