import DataLoader from 'dataloader';
import { Updoot } from '../entities/Updoot';

// This runs on every request since it is required in the context of gql client
// This batches and caches loading of users within a single request

// arguments [{postId:4, userId:5}]
// we load and return [{postId:4, userId:5, value:1}]
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(async (keys) => {
    const updoots = await Updoot.findBy(keys as any);
    const updootIdstoUpdoot: Record<string, Updoot> = {};
    updoots.forEach((updoot) => {
      updootIdstoUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
    });
    return keys.map((key) => updootIdstoUpdoot[`${key.userId}|${key.postId}`]);
  });
