import clsx from 'clsx';
import { useRouter } from 'next/router';
import React from 'react';
import { Room, RoomType } from '../../api/RoomApi';
import { useAsyncAction } from '../../hooks/useAction';
import { fetchCreateRoom } from '../../redux/slices/roomsSlice';
import { Button } from '../Button';

import styles from './StartRoomModal.module.scss';

interface StartRoomModalProps {
  onClose: () => void;
}

export const StartRoomModal: React.FC<StartRoomModalProps> = ({ onClose }) => {
  const router = useRouter();
  const [title, setTitle] = React.useState<string>('');
  const [type, setType] = React.useState<RoomType>('open');
  const createRoom = useAsyncAction<any, Room>(fetchCreateRoom);

  const onSubmit = async () => {
    if (!title) {
      return alert('Укажите заголовок комнаты');
    }
    const data: Room = await createRoom({ title, type });
    router.push(`/rooms/${data.id}`);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <img
          width="24px"
          height="24px"
          src="/static/close.svg"
          alt="Close"
          className={styles.closeBtn}
          onClick={onClose}
        />
        <div className="mb-30">
          <h3>Topic</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.inputTitle}
            placeholder="Enter the topic to be discussed"
          />
        </div>
        <div className="mb-30">
          <h3>Room type</h3>
          <div className="d-flex justify-content-between">
            <div
              onClick={() => setType('open')}
              className={clsx(styles.roomType, { [styles.roomTypeActive]: type === 'open' })}>
              <img width="70px" height="70px" src="/static/room-type-1.png" alt="Room type" />
              <h5>Open</h5>
            </div>
            <div
              onClick={() => setType('social')}
              className={clsx(styles.roomType, { [styles.roomTypeActive]: type === 'social' })}>
              <img width="70px" height="70px" src="/static/room-type-2.png" alt="Room type" />
              <h5>Social</h5>
            </div>
            <div
              onClick={() => setType('closed')}
              className={clsx(styles.roomType, { [styles.roomTypeActive]: type === 'closed' })}>
              <img width="70px" height="70px" src="/static/room-type-3.png" alt="Room type" />
              <h5>Closed</h5>
            </div>
          </div>
        </div>
        <div className={styles.delimiter}></div>
        <div className="text-center">
          <h3>Start a room open to everyone</h3>
          <Button onClick={onSubmit} color="green">
            <img width="18px" height="18px" src="/static/celebration.png" alt="Celebration" />
            Let's go
          </Button>
        </div>
      </div>
    </div>
  );
};
