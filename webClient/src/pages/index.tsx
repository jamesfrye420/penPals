import { NextPage } from 'next';
import { useRouter } from 'next/router';
import IndexHeader from '../components/IndexHeader';
import Layout from '../components/Layout';
import PostStack from '../components/PostStack';
import { PaginatedPosts, usePostsQuery } from '../generated/graphql';

const Index: NextPage = () => {
  const router = useRouter();
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 20,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    <div>oops we had trouble connecting to server, try again later</div>;
  }

  const fetchMoreVar = () => ({
    variables: {
      limit: variables?.limit,
      cursor: data?.posts.posts[data?.posts.posts.length - 1]?.createdAt,
    },
  });

  return (
    <Layout>
      <IndexHeader />
      <PostStack
        data={data?.posts as PaginatedPosts | undefined}
        fetchMore={fetchMore}
        fetchMoreVar={fetchMoreVar}
        loading={loading}
        variables={variables}
      />
    </Layout>
  );
};

// we could also use getServerSideProps and render it server side using next js server side rendering
// doing that we wont be able to use the react hooks by graphql code gen and I would be wirting a bunch of manual graphql queries
export default Index;
