import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { UserData } from '../../pages';
import { RootState } from '../types';

export type UserSliceState = {
  data: UserData | null;
};

const initialState: UserSliceState = {
  data: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(HYDRATE as any, (state, action: PayloadAction<RootState>) => {
      state.data = action.payload.user.data;
    }),
});

export const { setUserData } = userSlice.actions;
export const userReducer = userSlice.reducer;
