import { UserData } from '../pages';

export type SocketRoom = Record<string, { roomId: string; user: UserData }>;

export const getUsersFromRoom = (rooms: SocketRoom, roomId: string) =>
  Object.values(rooms)
    .filter((obj) => obj.roomId === roomId)
    .map((obj) => ({ ...obj.user, roomId: Number(roomId) }));
