import { Flex, Heading, Link, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import UpdootSection from '../../components/UpdootSection';
import { usePostQuery } from '../../generated/graphql';
import { useGetIdFromUrl } from '../../hooks';

const Post: NextPage = () => {
  const router = useRouter();
  const id = useGetIdFromUrl();
  const { data, error, loading } = usePostQuery({
    skip: id === -1,
    variables: {
      postId: id,
    },
  });
  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  if (!data?.Post) {
    return (
      <Layout>
        <div>could not find post</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Flex p={5} alignItems="flex-start">
        <UpdootSection post={data.Post as any} />
        <Flex flexDirection={'column'} alignItems="flex-start" width={'100%'}>
          <Flex zIndex={2} gap={2} mb={2} alignItems={'baseline'}>
            {data.Post.sub?.name && (
              <Text fontSize={'sm'} fontWeight={'bold'}>
                <NextLink href={'/r/[subIdentifier]'} as={`/r/${data.Post.sub.subIdentifier}`}>
                  <Link>r/{data.Post.sub.subIdentifier} </Link>
                </NextLink>
              </Text>
            )}
            <Text fontSize={'sm'}>
              posted by{' '}
              <NextLink href={'/u/[username]'} as={`/u/${data.Post.creator.username}`}>
                <Link>u/{data.Post.creator.username}</Link>
              </NextLink>
            </Text>
          </Flex>
          <Heading mb={20}>{data.Post.title}</Heading>
          {data.Post.text}
        </Flex>
        <EditDeletePostButtons id={data.Post.id} creatorId={data.Post.creator.id} />
      </Flex>
    </Layout>
  );
};

export default Post;
