import { RoomsSliceState } from './slices/roomsSlice';
import { UserSliceState } from './slices/userSlice';

export type RootState = {
  user: UserSliceState;
  rooms: RoomsSliceState;
};
