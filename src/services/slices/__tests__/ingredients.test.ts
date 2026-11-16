import ingredientsReducer, {
  fetchIngredients,
  selectIngredients,
  selectIngredientsState,
} from '../ingredients';
import { bun, filling, sauce } from './fixtures';

const REQUEST_ID = 'ingredients-request';
const UNKNOWN_ACTION = { type: 'UNKNOWN' };

describe('ingredients reducer', () => {
  test('returns the initial state for an unknown action and undefined state', () => {
    expect(ingredientsReducer(undefined, UNKNOWN_ACTION)).toEqual({
      items: [],
      isLoading: false,
      error: null,
      loaded: false,
    });
  });

  test('keeps the current state for an unknown action', () => {
    const state = { items: [bun], isLoading: false, error: null, loaded: true };
    expect(ingredientsReducer(state, UNKNOWN_ACTION)).toBe(state);
  });

  test('pending starts loading and clears an error without removing cached ingredients', () => {
    const state = {
      items: [bun],
      isLoading: false,
      error: 'Предыдущая ошибка',
      loaded: true,
    };
    const result = ingredientsReducer(
      state,
      fetchIngredients.pending(REQUEST_ID, undefined)
    );
    expect(result).toEqual({ items: [bun], isLoading: true, error: null, loaded: true });
    expect(state).toEqual({
      items: [bun],
      isLoading: false,
      error: 'Предыдущая ошибка',
      loaded: true,
    });
  });

  test('fulfilled stores the server response and finishes loading', () => {
    const state = { items: [bun], isLoading: true, error: null, loaded: false };
    const response = [filling, sauce];
    const result = ingredientsReducer(
      state,
      fetchIngredients.fulfilled(response, REQUEST_ID, undefined)
    );
    expect(result).toEqual({
      items: response,
      isLoading: false,
      error: null,
      loaded: true,
    });
    expect(state.items).toEqual([bun]);
    expect(state.isLoading).toBe(true);
  });

  test('fulfilled handles an empty ingredient catalog as a completed request', () => {
    const state = { items: [bun], isLoading: true, error: null, loaded: true };
    expect(
      ingredientsReducer(state, fetchIngredients.fulfilled([], REQUEST_ID, undefined))
    ).toEqual({
      items: [],
      isLoading: false,
      error: null,
      loaded: true,
    });
  });

  test('rejected finishes an initial request and saves its error', () => {
    const state = { items: [], isLoading: true, error: null, loaded: false };
    const action = fetchIngredients.rejected(
      new Error('Сервер недоступен'),
      REQUEST_ID,
      undefined
    );
    expect(ingredientsReducer(state, action)).toEqual({
      items: [],
      isLoading: false,
      error: 'Сервер недоступен',
      loaded: false,
    });
  });

  test('rejected preserves a previously loaded catalog', () => {
    const state = { items: [bun], isLoading: true, error: null, loaded: true };
    const action = fetchIngredients.rejected(
      new Error('Ошибка обновления'),
      REQUEST_ID,
      undefined
    );
    expect(ingredientsReducer(state, action)).toEqual({
      items: [bun],
      isLoading: false,
      error: 'Ошибка обновления',
      loaded: true,
    });
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  test('rejected uses the fallback message when the error has no message', () => {
    const state = { items: [], isLoading: true, error: null, loaded: false };
    const action = {
      ...fetchIngredients.rejected(null, REQUEST_ID, undefined),
      error: {},
    };
    expect(ingredientsReducer(state, action)).toEqual({
      items: [],
      isLoading: false,
      error: 'Не удалось загрузить ингредиенты',
      loaded: false,
    });
  });

  test('selectors expose the ingredient array and its loading state', () => {
    const state = { items: [bun], isLoading: false, error: null, loaded: true };
    expect(selectIngredients({ ingredients: state })).toBe(state.items);
    expect(selectIngredientsState({ ingredients: state })).toBe(state);
  });
});
