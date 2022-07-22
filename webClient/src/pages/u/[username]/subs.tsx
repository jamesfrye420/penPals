import { Box, Flex, Heading, LinkBox, LinkOverlay, Spinner, Stack, Text, textDecoration } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Layout from '../../../components/Layout';
import UserHeader from '../../../components/UserHeader';
import { useMeQuery, useUserSubsQuery } from '../../../generated/graphql';
import FollowButton from '../../../components/FollowButton';
import { NextPage } from 'next';

const AllSubs: NextPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { data: meData } = useMeQuery();
  const { data, loading } = useUserSubsQuery({
    fetchPolicy: 'cache-and-network',
    variables: {
      username: username as string,
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

  if (data.userSubs.length <= 0 && !loading) {
    return (
      <Layout>
        <UserHeader pathname={router.pathname} username={username as string} />

        <Box>No Subs Found</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <UserHeader pathname={router.pathname} username={username as string} />
      <Stack>
        {data.userSubs.map(
          (sub) =>
            sub && (
              <LinkBox as={Flex} cursor={'pointer'} key={sub.id} p={5} shadow="md" borderWidth={'1px'} alignItems="flex-start">
                <Flex flexDirection={'column'} alignItems="flex-start" width={'100%'}>
                  <Flex alignItems={'center'}>
                    <Heading fontSize={'xl'} mr={4}>
                      {sub.name}
                    </Heading>
                    {meData?.me?.username && sub.creator.username !== meData.me.username && (
                      <FollowButton followStatus={sub.followStatus} subId={sub.id} />
                    )}
                  </Flex>
                  <NextLink href={'/r/[subIdentifier]'} as={`/r/${sub.subIdentifier}`}>
                    <LinkOverlay>
                      <Text>r/{sub.subIdentifier}</Text>
                    </LinkOverlay>
                  </NextLink>
                </Flex>
                <Text ml={'auto'}>created on: {new Date(parseInt(sub.createdAt)).toDateString()}</Text>
              </LinkBox>
            )
        )}
      </Stack>
    </Layout>
  );
};

export default AllSubs;
