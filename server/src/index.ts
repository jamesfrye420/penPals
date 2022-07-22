import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import path from 'path';
import { COOKIE_NAME, __prod__ } from './constants';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { createUserLoader } from './utils/createUserLoader';

import { MyContext } from './types';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { Sub } from './entities/Sub';
import { SubResolver } from './resolvers/sub';
import { createSubLoader } from './utils/createSubLoader';
import { Follower } from './entities/Follower';
import { createFollowerLoader } from './utils/createFollowerLodader';
import { SearchResolver } from './resolvers/search';

const dataSource = new DataSource({
  type: 'postgres',
  database: 'lireddit2',
  username: 'postgres',
  password: 'postgres',
  logging: true,
  synchronize: true,
  migrations: [path.join(__dirname, './migrations/*')],
  entities: [Post, User, Updoot, Sub, Follower],
});
const main = async () => {
  await dataSource.initialize();
  await dataSource.runMigrations();

  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
      credentials: true,
    })
  );

  // connect-redis provides Redis session storage for Express
  const RedisStore = connectRedis(session);
  //  connect to redis client
  const redis = new Redis();

  app.use(
    // The express-session package uses touch to signal to the store that
    // the user has interacted with the session but hasn't changed anything in its data.
    // As long as a session gets modified during a request, it will not expire
    // we can always remove the session if we need to.

    // default ttl 86400 seconds or one day
    // The TTL is reset every time a user interacts with the server.
    // You can disable this behavior in some instances by using disableTouch

    // resave forces the session to be saved back to the session store,
    // even if the session was never modified during the request.
    // setting this to false will reduce ping to redis server (touch takes care of this)

    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis }),
      cookie: {
        // The maxAge value is basically used for an idle timer:
        // if the session hasn't been modified at all for maxAge ms, the session will expire
        maxAge: 1000 * 60 * 60 * 24 * 60, //60 days in milli sec

        // If the HttpOnly flag (optional) is included in the HTTP response header,
        // the cookie cannot be accessed through client side script (again if the browser supports this flag).
        // As a result, even if a cross-site scripting (XSS) flaw exists, and a user accidentally accesses a link that exploits this flaw,
        // the browser (primarily Internet Explorer) will not reveal the cookie to a third party.
        // see https://owasp.org/www-community/HttpOnly
        httpOnly: true,

        // cookie only works in https, enabled if production env is set to true
        secure: false,

        // Lax allows the cookie to be sent on some cross-site requests for csrf attack protection,
        // whereas Strict never allows the cookie to be sent on a cross-site request.
        // for more refference see https://stackoverflow.com/questions/59990864/what-is-difference-between-samesite-lax-and-samesite-strict
        sameSite: 'lax',
      },
      saveUninitialized: false, // prevents storing empty sessions
      secret: 'secret',
      resave: false,
    })
  );

  const schema = await buildSchema({
    resolvers: [PostResolver, UserResolver, SubResolver,SearchResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',

    // makes a property avlaiable to all resolvers
    // here the orm.em property is exposed to all resolvers in the resolvers array
    // also the req and res object from express is exposed to all resolvers,
    // this in turn enables the resolvers to access session data innthe req object if any
    context: ({ req, res }): MyContext => ({
      dataSource,
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
      subLoader: createSubLoader(),
      followerLoader: createFollowerLoader(),
    }),
  });

  // const cors = { credentials: true, origin: 'https://studio.apollographql.com, http://localhost:3000' };
  await apolloServer.start();

  // app.set('trust proxy', true);

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log('server started on port 4000!');
  });
};

main();
