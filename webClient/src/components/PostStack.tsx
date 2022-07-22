import { Stack, Flex, Heading, Box, Text, Button, Link, LinkBox, LinkOverlay } from '@chakra-ui/react';
import NextLink from 'next/link';
import { PaginatedPosts } from '../generated/graphql';
import EditDeletePostButtons from './EditDeletePostButtons';
import UpdootSection from './UpdootSection';

interface Props {
  data: PaginatedPosts | undefined;
  fetchMore: any;
  loading: boolean;
  variables: any;
  fetchMoreVar: any;
}

const PostStack = ({ data, fetchMore, loading, fetchMoreVar }: Props) => {
  if (data && data.posts.length <= 0) {
    return <Box>No Posts to Display</Box>;
  }
  return (
    <>
      {!data && loading ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data?.posts.map(
            (p) =>
              p && (
                <LinkBox as={Flex} cursor={'pointer'} key={p.id} p={5} shadow="md" borderWidth={'1px'} alignItems="flex-start">
                  <UpdootSection post={p} />
                  <Flex flexDirection={'column'} alignItems="flex-start" width={'100%'}>
                    <Flex zIndex={2} gap={2} mb={2} alignItems={'center'}>
                      {p.sub?.name && (
                        <Text fontSize={'2xl'} fontWeight={'bold'}>
                          <NextLink href={'/r/[subIdentifier]'} as={`/r/${p.sub.subIdentifier}`}>
                            <Link>r/{p.sub.subIdentifier} </Link>
                          </NextLink>
                        </Text>
                      )}
                      <Text>
                        posted by{' '}
                        <NextLink href={'/u/[username]'} as={`/u/${p.creator.username}`}>
                          <Link>u/{p.creator.username}</Link>
                        </NextLink>
                      </Text>
                    </Flex>
                    <NextLink href={`/post/[id]`} as={`/post/${p.id}`}>
                      <LinkOverlay>
                        <Heading fontSize={'large'}>{p.title}</Heading>
                      </LinkOverlay>
                    </NextLink>
                    <Text mt={4}>{p.textSnippet}...</Text>
                  </Flex>
                  <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                </LinkBox>
              )
          )}
        </Stack>
      )}
      {data && data.hasMore && (
        <Flex>
          <Button
            onClick={() => {
              fetchMore(fetchMoreVar());
            }}
            isLoading={loading}
            margin={'auto'}
            my={8}
          >
            Load More
          </Button>
        </Flex>
      )}
    </>
  );
};

export default PostStack;
