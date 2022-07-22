import { Flex, Heading, Button, Box, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { useMeQuery } from '../generated/graphql';

interface Props {
  username: string;
  pathname: string;
}

const UserHeader = ({ username, pathname }: Props) => {
  const { data: meData } = useMeQuery();
  return (
    <>
      <Flex alignItems={'center'} maxW={800}>
        <Heading mb={4}>u/{username}</Heading>
        {meData?.me?.username === username && (
          <Box ml="auto">
            <NextLink href={'/create-sub'}>
              <Button as={Link} mr={8}>
                Create A new Sub
              </Button>
            </NextLink>
            <NextLink href={'/create-post'}>
              <Button as={Link}>Create Post</Button>
            </NextLink>
          </Box>
        )}
      </Flex>
      <Flex my={4} justifyContent={'center'} borderBottom="1px" borderBottomColor={'InfoText'} borderBottomStyle={'outset'}>
        <Box>
          <NextLink href={'/u/[username]'} as={`/u/${username}`}>
            <Link color={pathname === '/u/[username]' ? 'GrayText' : ''} mr={10}>
              Posts
            </Link>
          </NextLink>
          <NextLink href={'/u/[username]/subs'} as={`/u/${username}/subs`}>
            <Link color={pathname === '/u/[username]/subs' ? 'GrayText' : ''} mr={10}>
              Subs
            </Link>
          </NextLink>
        </Box>
      </Flex>
    </>
  );
};

export default UserHeader;
