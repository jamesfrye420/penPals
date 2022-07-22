import { FollowMutation, useFollowMutation } from '../generated/graphql';
import { CheckIcon, SmallAddIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { ApolloCache, gql } from '@apollo/client';

interface Props {
  followStatus: boolean | null | undefined;
  subId: number;
}

const updateAfterFollow = (value: boolean, subId: number, cache: ApolloCache<FollowMutation>) => {
  const data = cache.readFragment<{
    id: number;
    numberOfFollowers: number;
    followStatus: Boolean | null;
  }>({
    id: 'Sub:' + subId,
    fragment: gql`
      fragment _ on Sub {
        id
        numberOfFollowers
        followStatus
      }
    `,
  });
  if (data) {
    if (data.followStatus === value) {
      return;
    }

    const followerIncrementOrDecrement = value ? 1 : -1;

    cache.writeFragment({
      id: 'Sub:' + subId,
      fragment: gql`
        fragment __ on Sub {
          numberOfFollowers
          followStatus
        }
      `,
      data: { numberOfFollowers: +data.numberOfFollowers + followerIncrementOrDecrement, followStatus: value },
    });
  }
};

const FollowButton = ({ followStatus, subId }: Props) => {
  const [followMutation] = useFollowMutation();

  return (
    <>
      {(followStatus !== null || undefined) && (
        <IconButton
          zIndex={4}
          _hover={{ bgColor: 'peru' }}
          aria-label="follow or unfollow"
          icon={followStatus ? <CheckIcon /> : <SmallAddIcon />}
          onClick={() => {
            followMutation({
              variables: {
                subId,
              },
              update: (cache) => {
                // if the follow status is true then we update it to false else true
                const value = followStatus ? false : true;
                cache.evict({ fieldName: 'userFollowingSubsPosts' });

                return updateAfterFollow(value, subId, cache);
              },
            });
          }}
        />
      )}
    </>
  );
};

export default FollowButton;
