import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { IconButton, Box, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface Props {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons = ({ id, creatorId }: Props) => {
  const [deletePost] = useDeletePostMutation();
  const { data: meData } = useMeQuery();

  if (!(meData?.me?.id === creatorId)) {
    return null;
  }

  return (
    <Box ml={'auto'}>
      <NextLink href={'/post/edit/[id]'} as={`/post/edit/${id}`}>
        <IconButton
          _hover={{ bgColor: 'cornflowerblue', color: 'white' }}
          mr={4}
          mb={4}
          as={Link}
          aria-label="edit Post"
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        _hover={{ bgColor: 'red', color: 'white' }}
        zIndex={4}
        aria-label="delete Post"
        icon={<DeleteIcon />}
        onClick={() => {
          deletePost({
            variables: { deletePostId: id },
            update: (cache) => {
              // Post:1
              cache.evict({ id: 'Post:' + id });
            },
          });
        }}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
