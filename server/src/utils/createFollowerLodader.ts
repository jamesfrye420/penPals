import DataLoader from 'dataloader';
import { Follower } from '../entities/Follower';

// This runs on every request since it is required in the context of gql client
// This batches and caches loading of followers within a single request

export const createFollowerLoader = () =>
  new DataLoader<{ subId: number; userId: number }, Follower | null>(async (keys) => {
    const followers = await Follower.findBy(keys as any);
    const followerIdstoFollower: Record<string, Follower> = {};
    followers.forEach((follower) => {
      followerIdstoFollower[`${follower.userId}|${follower.subId}`] = follower;
    });
    return keys.map((key) => followerIdstoFollower[`${key.userId}|${key.subId}`]);
  });
