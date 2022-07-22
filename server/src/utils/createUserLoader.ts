import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { User } from '../entities/User';

// This runs on every request since it is required in the context of gql client
// This batches and caches loading of users within a single request
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as number[]) });
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    return userIds.map((userIds) => userIdToUser[userIds]);
  });
