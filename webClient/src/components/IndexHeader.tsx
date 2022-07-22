import { Flex, Box, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const IndexHeader = () => {
  const router = useRouter();
  return (
    <Flex my={4} justifyContent={'center'} borderBottom="1px" borderBottomColor={'InfoText'} borderBottomStyle={'outset'}>
      <Box>
        <NextLink href={'/'}>
          <Link color={router.pathname === '/' ? 'GrayText' : ''} mr={10}>
            Discover
          </Link>
        </NextLink>
        <NextLink href={'/following-feed'}>
          <Link color={router.pathname === '/following-feed' ? 'GrayText' : ''} mr={10}>
            Your Feed
          </Link>
        </NextLink>
      </Box>
    </Flex>
  );
};

export default IndexHeader;
