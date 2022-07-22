import { Box, Button, Flex, Heading, Link, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Layout from '../../components/Layout';
import { PaginatedPosts, useMeQuery, useSubPostsQuery, useSubQuery } from '../../generated/graphql';
import PostStack from '../../components/PostStack';
import FollowButton from '../../components/FollowButton';
import { NextPage } from 'next';

const SubPage: NextPage = () => {
  const router = useRouter();
  const { subIdentifier } = router.query;
  const { data: meData } = useMeQuery();
  const { data, loading } = useSubQuery({
    variables: {
      subIdentifier: subIdentifier as string,
    },
  });
  const {
    data: postsData,
    loading: postsLoading,
    fetchMore,
    variables,
  } = useSubPostsQuery({
    variables: {
      limit: 15,
      subIdentifier: subIdentifier as string,
    },
  });
  if (!data && !loading) {
    return (
      <Layout>
        <Box>OOps something went wrong, try again later</Box>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Layout>
    );
  }

  if (!data.sub && !loading) {
    return (
      <Layout>
        <Box>No sub found with this name</Box>
      </Layout>
    );
  }

  const fetchMoreVar = () => ({
    variables: {
      limit: variables?.limit,
      cursor: postsData?.subPosts.posts[postsData?.subPosts.posts.length - 1]?.createdAt,
      subIdentifier: variables?.subIdentifier,
    },
  });

  return (
    <Layout>
      <Flex
        alignItems={'baseline'}
        maxW={800}
        borderBottom="1px"
        borderBottomColor={'blackAlpha.700'}
        borderBottomStyle="ridge"
      >
        <Box mb={4}>
          <Flex alignItems={'baseline'}>
            <Heading mr={4} mb={0.5}>
              {data.sub?.name}
            </Heading>
            {data.sub?.creator.username !== meData?.me?.username && (
              <FollowButton followStatus={data.sub?.followStatus} subId={data.sub?.id as number} />
            )}
          </Flex>
          <Text>r/{data.sub?.subIdentifier}</Text>
          <Text>{data.sub?.numberOfFollowers} followers</Text>
        </Box>
        {meData?.me?.username && (
          <Box ml="auto">
            <NextLink href={'/create-post?sub=' + subIdentifier}>
              <Button as={Link}>Create Post</Button>
            </NextLink>
          </Box>
        )}
      </Flex>
      <PostStack
        data={postsData?.subPosts as PaginatedPosts | undefined}
        fetchMore={fetchMore}
        fetchMoreVar={fetchMoreVar}
        loading={postsLoading}
        variables={variables}
      />
    </Layout>
  );
};

export default SubPage;
