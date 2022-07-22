import { Sub } from '../entities/Sub';
import { isAuth } from '../middleware/isAuth';
import { Arg, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { MyContext } from '../types';
import { SubDetailsInput } from './subDetailsInput';
import { FieldError } from './FieldError';
import { User } from '../entities/User';
import { Follower } from '../entities/Follower';

// object types can be returned
@ObjectType()
class SubResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Sub, { nullable: true })
  sub?: Sub;
}

@Resolver(Sub)
export class SubResolver {
  @FieldResolver(() => User)
  creator(@Root() sub: Sub, @Ctx() { userLoader }: MyContext) {
    // Using typeorm like this has major performance issue
    // for e.g this runs 15 sql find queries just to load the home page
    // return User.findOneBy({ id: sub.creatorId });

    // so we use data loader to bacth these into single queries
    return userLoader.load(sub.creatorId);
  }

  @FieldResolver(() => Boolean, { nullable: true })
  async followStatus(@Root() sub: Sub, @Ctx() { followerLoader, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const follower = await followerLoader.load({ subId: sub.id, userId: req.session.userId });
    return follower ? true : false;
  }

  @Mutation(() => SubResponse)
  @UseMiddleware(isAuth)
  async registerSub(@Arg('options') options: SubDetailsInput, @Ctx() { dataSource, req }: MyContext): Promise<SubResponse> {
    const errors: FieldError[] = [];

    if (options.name.length <= 2) {
      errors.push({
        field: 'name',
        message: 'length must be greated than 2',
      });
    }
    if (options.subIdentifier.length <= 2) {
      errors.push({
        field: 'subIdentifier',
        message: 'length mush be greater than 2',
      });
    }

    if (errors.length > 0) {
      return { errors };
    }
    let sub;
    try {
      const result = await dataSource
        .createQueryBuilder()
        .insert()
        .into(Sub)
        .values({
          name: options.name,
          subIdentifier: options.subIdentifier,
          creatorId: req.session.userId,
        })
        .returning('*')
        .execute();
      sub = result.raw[0];
    } catch (err) {
      // duplicate username error
      if (err.code === '23505' || err.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'subIdentifier',
              message: 'subIdentifier already taken',
            },
          ],
        };
      }
    }

    return {
      sub,
    };
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async follow(@Arg('subId', () => Int) subId: number, @Ctx() { req, dataSource }: MyContext) {
    const { userId } = req.session;
    const creator = await Sub.findOneBy({ id: subId, creatorId: userId });
    if (creator) {
      return null;
    }
    const follow = await Follower.findOne({ where: { subId, userId } });

    if (follow) {
      await dataSource.transaction(async (tm) => {
        // if already followed
        await tm.query(
          `
          DELETE FROM follower 
          WHERE id=$1
        `,
          [follow.id]
        );

        await tm.query(
          `
          UPDATE sub
          set "numberOfFollowers" = "numberOfFollowers" - 1 
          WHERE id=$1
        `,
          [subId]
        );
      });
      return true;
    } else if (!follow) {
      await dataSource.transaction(async (tm) => {
        await tm.insert(Follower, { subId, userId });

        await tm.query(
          `
          UPDATE sub
          set "numberOfFollowers" = "numberOfFollowers" + 1 
          WHERE id=$1
        `,
          [subId]
        );
      });
      return false;
    }
    return null;
  }

  @Query(() => [Sub])
  async userSubs(@Arg('username', () => String) username: string, @Ctx() { dataSource }: MyContext) {
    const subs = await dataSource.query(
      `
    SELECT s.* 

    FROM sub s

    INNER JOIN users u on s."creatorId" = u.id 

    WHERE u.username=$1
    `,
      [username]
    );

    return subs;
  }

  @Query(() => Sub, { nullable: true })
  sub(@Arg('subIdentifier', () => String) subIdentifier: string) {
    return Sub.findOneBy({ subIdentifier });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteSub(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<Boolean> {
    await Sub.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
