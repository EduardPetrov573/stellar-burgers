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
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

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
  setCookie('accessToken', data.accessToken, { sameSite: 'Lax' });
  localStorage.setItem('refreshToken', data.refreshToken);
};
export const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};
export const checkUser = createAsyncThunk(
  'user/check',
  async () => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) return null;
    try {
      if (!getCookie('accessToken')) await refreshToken();
      const data = await getUserApi();
      if (!data.success) throw new Error('Не удалось проверить авторизацию');
      return data.user;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
  { condition: (_, { getState }) => !(getState() as { user: UserState }).user.checking }
);
export const login = createAsyncThunk('user/login', async (credentials: TLoginData) => {
  const data = await loginUserApi(credentials);
  saveTokens(data);
  return data.user;
});
export const register = createAsyncThunk(
  'user/register',
  async (credentials: TRegisterData) => {
    const data = await registerUserApi(credentials);
    saveTokens(data);
    return data.user;
  }
);
export const updateUser = createAsyncThunk(
  'user/update',
  async (changes: Partial<TRegisterData>) => {
    const data = await updateUserApi(changes);
    if (!data.success) throw new Error('Не удалось сохранить профиль');
    return data.user;
  }
);
export const logout = createAsyncThunk('user/logout', async () => {
  const data = await logoutApi();
  if (!data.success) throw new Error('Не удалось выйти');
  clearTokens();
});
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email: string) => {
    await forgotPasswordApi({ email });
    sessionStorage.setItem('resetPassword', 'true');
  }
);
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (data: { password: string; token: string }) => {
    await resetPasswordApi(data);
    sessionStorage.removeItem('resetPassword');
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
