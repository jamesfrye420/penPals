import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import 'express-session';
import { Redis } from 'ioredis';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { createFollowerLoader } from './utils/createFollowerLodader';
import { createSubLoader } from './utils/createSubLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

// using declaration merging to extend session object
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L23
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  dataSource: DataSource;
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: DataLoader<number, User, number>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
  subLoader: ReturnType<typeof createSubLoader>;
  followerLoader: ReturnType<typeof createFollowerLoader>;
};
