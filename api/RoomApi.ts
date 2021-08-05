import { AxiosInstance } from 'axios';
import { UserData } from '../pages';

export type UserWithRoomId = UserData & { roomId: number };

export interface Room {
  id: number;
  title: string;
  speakers: UserWithRoomId[];
  listenersCount: number;
}

export type RoomType = 'open' | 'social' | 'closed';

export const RoomApi = (instance: AxiosInstance) => {
  return {
    getRooms: async (): Promise<Room[]> => {
      const { data } = await instance.get('/rooms');
      return data;
    },
    getRoom: async (id: string): Promise<Room> => {
      const { data } = await instance.get(`/rooms/${id}`);
      return data;
    },
    createRoom: async (form: { title: string; type: RoomType }): Promise<Room> => {
      const { data } = await instance.post('/rooms', form);
      return data;
    },
    deleteRoom: async (id: number): Promise<void> => instance.delete(`/rooms/${id}`),
  };
};
