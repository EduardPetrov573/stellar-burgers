import { combineReducers } from '@reduxjs/toolkit';

import burgerConstructor from './slices/constructor';
import feed from './slices/feed';
import ingredients from './slices/ingredients';
import orders from './slices/orders';
import user from './slices/user';

export const rootReducer = combineReducers({
  burgerConstructor,
  feed,
  ingredients,
  orders,
  user,
});
