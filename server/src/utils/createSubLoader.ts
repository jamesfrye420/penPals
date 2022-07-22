import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Sub } from '../entities/Sub';

// This runs on every request since it is required in the context of gql client
// This batches and caches loading of users within a single request
export const createSubLoader = () =>
  new DataLoader<number, Sub>(async (subIds) => {
    const subs = await Sub.findBy({ id: In(subIds as number[]) });
    const subsIdToSubs: Record<number, Sub> = {};
    subs.forEach((s) => {
      subsIdToSubs[s.id] = s;
    });
    return subIds.map((subIds) => subsIdToSubs[subIds]);
  });
