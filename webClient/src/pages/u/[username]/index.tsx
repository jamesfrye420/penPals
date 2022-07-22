import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import PostStack from '../../../components/PostStack';
import UserHeader from '../../../components/UserHeader';
import { PaginatedPosts, useUserPostsQuery } from '../../../generated/graphql';

const UserPage: NextPage = () => {
  const router = useRouter();
  const { username } = router.query;

  const { data, loading, fetchMore, variables } = useUserPostsQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: 15,
      cursor: null,
      username: username as string,
    },
  });

  if (!loading && !data) {
    <div>oops we had trouble connecting to server, try again later</div>;
  }

  const fetchMoreVar = () => ({
    variables: {
      limit: variables?.limit,
      cursor: data?.userPosts.posts[data?.userPosts.posts.length - 1]?.createdAt,
      username: variables?.username,
    },
  });

  return (
    <Layout>
      <UserHeader pathname={router.pathname} username={username as string} />

      <PostStack
        data={data?.userPosts as PaginatedPosts | undefined}
        fetchMore={fetchMore}
        fetchMoreVar={fetchMoreVar}
        loading={loading}
        variables={variables}
      />
    </Layout>
  );
};

export default UserPage;
