import { Stack, LinkBox, Flex, Heading, LinkOverlay, Link, Text } from '@chakra-ui/react';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../components/Layout';
import { useSearchQuery } from '../generated/graphql';

const Search: NextPage = () => {
  const router = useRouter();
  const keyword = typeof router.query.keyword === 'string' ? router.query.keyword : '';
  const { data } = useSearchQuery({
    skip: keyword === '',
    variables: {
      keyword,
    },
  });
  if (!data || !data.search || data.search.length <= 0) {
    return (
      <>
        <div>No data to display</div>
        <NextLink href={'/'}>
          <Link>Go Back</Link>
        </NextLink>
      </>
    );
  }
  return (
    <Layout>
      <Stack>
        {data.search.map(
          (Item, index) =>
            Item && (
              <LinkBox as={Flex} cursor={'pointer'} key={index} p={5} shadow="md" borderWidth={'1px'} alignItems="flex-start">
                <Flex flexDirection={'column'} alignItems="flex-start" width={'100%'}>
                  <Flex alignItems={'center'}>
                    <Heading fontSize={'xl'} mr={4}>
                      {Item}
                    </Heading>
                  </Flex>
                  <NextLink href={Item.charAt(0) === 'r' ? '/r/[subIdentifier]' : 'u/[username]'} as={Item}>
                    <LinkOverlay>
                      <Text>{Item}</Text>
                    </LinkOverlay>
                  </NextLink>
                </Flex>
              </LinkBox>
            )
        )}
      </Stack>
    </Layout>
  );
};

export default Search;
