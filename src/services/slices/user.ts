import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '@api';
import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  RESET_PASSWORD_KEY,
} from '@utils/constants';
import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import { createAppAsyncThunk } from '../create-app-async-thunk';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type UserState = {
  user: TUser | null;
  checked: boolean;
  checking: boolean;
  isLoading: boolean;
  error: string | null;
};
const initialState: UserState = {
  user: null,
  checked: false,
  checking: false,
  isLoading: false,
  error: null,
};
const saveTokens = (data: { accessToken: string; refreshToken: string }): void => {
  setCookie(ACCESS_TOKEN_KEY, data.accessToken, { sameSite: 'Lax' });
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
};
export const clearTokens = (): void => {
  deleteCookie(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
export const checkUser = createAppAsyncThunk(
  'user/check',
  async () => {
    if (!getCookie(ACCESS_TOKEN_KEY) && !localStorage.getItem(REFRESH_TOKEN_KEY))
      return null;
    try {
      if (!getCookie(ACCESS_TOKEN_KEY)) await refreshToken();
      const data = await getUserApi();
      if (!data.success) throw new Error('Не удалось проверить авторизацию');
      return data.user;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
  { condition: (_, { getState }) => !getState().user.checking }
);
export const login = createAppAsyncThunk(
  'user/login',
  async (credentials: TLoginData) => {
    const data = await loginUserApi(credentials);
    saveTokens(data);
    return data.user;
  }
);
export const register = createAppAsyncThunk(
  'user/register',
  async (credentials: TRegisterData) => {
    const data = await registerUserApi(credentials);
    saveTokens(data);
    return data.user;
  }
);
export const updateUser = createAppAsyncThunk(
  'user/update',
  async (changes: Partial<TRegisterData>) => {
    const data = await updateUserApi(changes);
    if (!data.success) throw new Error('Не удалось сохранить профиль');
    return data.user;
  }
);
export const logout = createAppAsyncThunk('user/logout', async () => {
  const data = await logoutApi();
  if (!data.success) throw new Error('Не удалось выйти');
  clearTokens();
});
export const forgotPassword = createAppAsyncThunk(
  'user/forgotPassword',
  async (email: string) => {
    await forgotPasswordApi({ email });
    sessionStorage.setItem(RESET_PASSWORD_KEY, 'true');
  }
);
export const resetPassword = createAppAsyncThunk(
  'user/resetPassword',
  async (data: { password: string; token: string }) => {
    await resetPasswordApi(data);
    sessionStorage.removeItem(RESET_PASSWORD_KEY);
  }
);
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUser.pending, (state) => {
        state.checking = true;
      })
      .addCase(checkUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checked = true;
        state.checking = false;
      })
      .addCase(checkUser.rejected, (state) => {
        state.user = null;
        state.checked = true;
        state.checking = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(
          login.pending,
          register.pending,
          updateUser.pending,
          logout.pending,
          forgotPassword.pending,
          resetPassword.pending
        ),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(login.fulfilled, register.fulfilled, updateUser.fulfilled),
        (state, action) => {
          state.user = action.payload;
          state.checked = true;
          state.isLoading = false;
        }
      )
      .addMatcher(
        isAnyOf(forgotPassword.fulfilled, resetPassword.fulfilled),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        isAnyOf(
          login.rejected,
          register.rejected,
          updateUser.rejected,
          logout.rejected,
          forgotPassword.rejected,
          resetPassword.rejected
        ),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message ?? 'Не удалось выполнить запрос';
        }
      );
  },
  selectors: { selectUserState: (state) => state, selectUser: (state) => state.user },
});
export const { clearUserError } = userSlice.actions;
export const { selectUserState, selectUser } = userSlice.selectors;
export default userSlice.reducer;
