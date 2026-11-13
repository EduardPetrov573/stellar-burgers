import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as dispatchHook, useSelector as selectorHook } from 'react-redux';

import { rootReducer } from './rootReducer';

import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;
export type AppThunk<Result = void> = ThunkAction<
  Result,
  RootState,
  unknown,
  UnknownAction
>;

export const useDispatch = dispatchHook.withTypes<AppDispatch>();
export const useSelector = selectorHook.withTypes<RootState>();

export default store;
