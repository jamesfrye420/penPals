import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, IconButton, Input, Link, Stack } from '@chakra-ui/react';
import { useLogoutMutation, useMeQuery, useSearchQuery } from '../generated/graphql';
import { useIsServer } from '../hooks';
import { useApolloClient } from '@apollo/client';
import { Search2Icon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

const NavBar = () => {
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const router = useRouter();
  const apolloClient = useApolloClient();

  const isServer = useIsServer();

  const [keyword, setKeyword] = useState<string>('');
  const { data: searchData, refetch } = useSearchQuery({
    skip: keyword === '',
    variables: {
      keyword,
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (keyword !== '') {
      router.push(`/search?keyword=${keyword}`);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      refetch({
        keyword,
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [keyword]);

  // we dont have the user cookie in the server when the page is rendered server side
  // so if the page is loading serverside, we skip the me query, which fetches the user data using the cookie stored in the client
  // this skips making unnecessary extra calls to the server
  const { data, loading } = useMeQuery({
    skip: isServer,
  });

  let body = null;
  // data is loading
  if (loading) {
    body = null;
  }
  // user not logged in
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  }
  // user logged in
  else {
    body = (
      <Flex alignItems={'center'}>
        <Box mr="2">
          <NextLink href={'/u/[username]'} as={`/u/${data.me.username}`}>
            <Link>{data.me.username}</Link>
          </NextLink>
        </Box>
        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
          variant={'link'}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={10} position={'sticky'} top={0} bg="tan" p={4} alignItems="center">
      <Flex flex={1} m={'auto'} alignItems={'center'} maxW={800} justifyContent={'space-between'}>
        <NextLink href={'/'}>
          <Heading cursor={'pointer'}>Pen Pals</Heading>
        </NextLink>

        <form onSubmit={handleSubmit}>
          <Flex>
            <Flex
              flexDirection={'column'}
              position={'relative'}
              onBlur={(e) => {
                // if the blur was because of outside focus
                // currentTarget is the parent element, relatedTarget is the clicked element

                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setKeyword('');
                }
              }}
            >
              <Input
                value={keyword}
                autoComplete={'off'}
                borderRightRadius={0}
                id="keyword"
                placeholder="search"
                size="md"
                maxW={400}
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              />
              {searchData?.search && (
                <Stack
                  spacing={4}
                  position={'absolute'}
                  top={'10'}
                  right={0}
                  left={0}
                  bgColor={'white'}
                  boxShadow={'2xl'}
                  tabIndex={0}
                >
                  {searchData.search.map(
                    (term) =>
                      term && (
                        <Box paddingX={4} width={'100%'}>
                          <NextLink href={term.charAt(0) === 'r' ? '/r/[subIdentifier]' : 'u/[username]'} as={term}>
                            <Link>{term}</Link>
                          </NextLink>
                        </Box>
                      )
                  )}
                </Stack>
              )}
            </Flex>
            <IconButton borderLeftRadius={0} aria-label="search" icon={<Search2Icon />} />
          </Flex>
        </form>

        <Box>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
