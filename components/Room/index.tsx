import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import Peer from 'simple-peer';
import { useRouter } from 'next/router';
import { Button } from '../Button';
import { Speaker } from '../Speaker';

import styles from './Room.module.scss';
import { selectUserData } from '../../redux/selectors';
import { useSelector } from 'react-redux';
import { UserData } from '../../pages';
import { useSocket } from '../../hooks/useSocket';

interface RoomProps {
  title: string;
}

let peers = [];

export const Room: React.FC<RoomProps> = ({ title }) => {
  const router = useRouter();
  const user = useSelector(selectUserData);
  const [users, setUsers] = React.useState<UserData[]>([]);
  const roomId = router.query.id;
  const socket = useSocket();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          socket.emit('CLIENT@ROOMS:JOIN', {
            user,
            roomId,
          });

          socket.on('SERVER@ROOMS:JOIN', (allUsers: UserData[]) => {
            console.log(allUsers);

            setUsers(allUsers);

            allUsers.forEach((speaker) => {
              if (user.id !== speaker.id && !peers.find((obj) => obj.id !== speaker.id)) {
                const peerIncome = new Peer({
                  initiator: true,
                  trickle: false,
                  stream,
                });

                // Получили сигнал от ICE-сервера и просим всех участников позвонить мне
                peerIncome.on('signal', (signal) => {
                  console.log(signal, 222);
                  console.log(
                    '1. СИГНАЛ СОЗДАН. ПРОСИМ ЮЗЕРА ' + speaker.fullname + ' НАМ ПОЗВОНИТЬ',
                  );
                  socket.emit('CLIENT@ROOMS:CALL', {
                    targetUserId: speaker.id,
                    callerUserId: user.id,
                    roomId,
                    signal,
                  });
                  peers.push({
                    peer: peerIncome,
                    id: speaker.id,
                  });
                });

                socket.on(
                  'SERVER@ROOMS:CALL',
                  ({ targetUserId, callerUserId, signal: callerSignal }) => {
                    console.log('2. ЮЗЕР ' + callerUserId + ' ПОДКЛЮЧИЛСЯ, ЗВОНИМ!');

                    const peerOutcome = new Peer({
                      initiator: false,
                      trickle: false,
                      stream,
                    });

                    // Звоним человеку м ждём сигнал, который нам необходимо передать обратно юзеру на ответ
                    peerOutcome.signal(callerSignal);

                    peerOutcome
                      // Получаем сигнал от ICE-сервера и отправляем его юзеру, чтобы он получил наш сигнал для соединения
                      .on('signal', (outSignal) => {
                        console.log(
                          '3. ПОЛУЧИЛИ СИГНАЛ НАШ, ОТПРАВЛЯЕМ В ОТВЕТ ЮЗЕРУ ' + callerUserId,
                        );
                        socket.emit('CLIENT@ROOMS:ANSWER', {
                          targetUserId: callerUserId,
                          callerUserId: targetUserId,
                          roomId,
                          signal: outSignal,
                        });
                      })
                      // Когда нам ответили, воспроизводим звук
                      .on('stream', (stream) => {
                        document.querySelector('audio').srcObject = stream;
                        document.querySelector('audio').play();
                      });
                  },
                );

                socket.on('SERVER@ROOMS:ANSWER', ({ callerUserId, signal }) => {
                  const obj = peers.find((obj) => Number(obj.id) === Number(callerUserId));
                  if (obj) {
                    obj.peer.signal(signal);
                  }
                  console.log('4. МЫ ОТВЕТИЛИ ЮЗЕРУ', callerUserId);
                });
              }
            });
          });

          socket.on('SERVER@ROOMS:LEAVE', (leaveUser: UserData) => {
            console.log(leaveUser.id, peers);
            setUsers((prev) =>
              prev.filter((prevUser) => {
                const peerUser = peers.find((obj) => Number(obj.id) === Number(leaveUser.id));
                if (peerUser) {
                  peerUser.peer.destroy();
                }
                return prevUser.id !== leaveUser.id;
              }),
            );
          });
        })
        .catch(() => {
          console.error('Нет доступа к микрофону');
        });
    }

    return () => {
      peers.forEach((obj) => {
        obj.peer.destroy();
      });
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <audio controls />
      <div className="d-flex align-items-center justify-content-between">
        <h2>{title}</h2>
        <div className={clsx('d-flex align-items-center', styles.actionButtons)}>
          <Link href="/rooms">
            <a>
              <Button color="gray" className={styles.leaveButton}>
                <img width={18} height={18} src="/static/peace.png" alt="Hand black" />
                Leave quietly
              </Button>
            </a>
          </Link>
        </div>
      </div>

      <div className="users">
        {users.map((obj) => (
          <Speaker key={obj.fullname} {...obj} />
        ))}
      </div>
    </div>
  );
};
