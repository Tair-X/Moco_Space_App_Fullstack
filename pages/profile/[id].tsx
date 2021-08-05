import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { UserData } from '..';
import { Api } from '../../api';
import { Header } from '../../components/Header';
import { Profile } from '../../components/Profile';
import { wrapper } from '../../redux/store';
import { checkAuth } from '../../utils/checkAuth';

interface ProfilePageProps {
  profileData: UserData | null;
}

const ProfilePage: NextPage<ProfilePageProps> = ({ profileData }) => {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="container mt-30">
        <Profile
          avatarUrl={profileData.avatarUrl}
          fullname={profileData.fullname}
          username={profileData.username}
          about="Test info"
        />
      </div>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps = wrapper.getServerSideProps(async (ctx) => {
  try {
    const user = await checkAuth(ctx);

    const userId = ctx.query.id;
    const profileData = await Api(ctx).getUserInfo(Number(userId));

    if (!user || !profileData) {
      throw new Error();
    }

    return {
      props: {
        profileData,
      },
    };
  } catch (error) {
    return {
      props: {},
      redirect: { permanent: false, destination: '/' },
    };
  }
});
