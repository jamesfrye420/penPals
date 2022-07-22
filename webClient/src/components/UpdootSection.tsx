import { ApolloCache } from '@apollo/client';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React from 'react';
import { PostSnippetFragment, useVoteMutation, VoteMutation } from '../generated/graphql';

interface Props {
  // this gives me the types of the result of the post query instead of the entire post schema which we get from type post
  // so this omits the properties of the posts which we dont fetch via the graphql query
  post: PostSnippetFragment;
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = +data.points + (!data.voteStatus ? 1 : 2) * +value;
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

const UpdootSection = ({ post }: Props) => {
  const [vote] = useVoteMutation();
  return (
    <Flex flexDirection={'column'} justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={() => {
          if (post.voteStatus === 1) {
            return;
          }
          vote({
            variables: {
              postId: post.id,
              value: 1,
            },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
        }}
        colorScheme={post.voteStatus === 1 ? 'green' : undefined}
        aria-label="up vote"
        icon={<ChevronUpIcon boxSize="24px" />}
      />
      {post.points}
      <IconButton
        onClick={() => {
          if (post.voteStatus === -1) {
            return;
          }
          vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
        }}
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        aria-label="up vote"
        icon={<ChevronDownIcon boxSize="24px" />}
      />
    </Flex>
  );
};

export default UpdootSection;
