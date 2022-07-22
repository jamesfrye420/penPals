import { NextPage } from 'next/types';
import IndexHeader from '../components/IndexHeader';
import Layout from '../components/Layout';
import PostStack from '../components/PostStack';
import { PaginatedPosts, useUserFollowingSubsPostsQuery } from '../generated/graphql';
import { useIsAuth } from '../hooks';

const FollowingFeed: NextPage = () => {
  useIsAuth();
  const { data, loading, fetchMore, variables } = useUserFollowingSubsPostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
  });

  if (!loading && !data) {
    <div>oops we had trouble connecting to server, try again later</div>;
  }

  const fetchMoreVar = () => ({
    variables: {
      limit: variables?.limit,
      cursor: data?.userFollowingSubsPosts.posts[data?.userFollowingSubsPosts.posts.length - 1]?.createdAt,
    },
  });

  return (
    <Layout>
      <IndexHeader />
      <PostStack
        data={data?.userFollowingSubsPosts as PaginatedPosts | undefined}
        fetchMore={fetchMore}
        fetchMoreVar={fetchMoreVar}
        loading={loading}
        variables={variables}
      />
    </Layout>
  );
};

export default FollowingFeed;
