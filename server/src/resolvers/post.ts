import { Post } from '../entities/Post';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';
import { parameterReplacement } from '../utils/parameterReplacement';
import { Sub } from '../entities/Sub';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text?: string;
  @Field({ nullable: true })
  subIdentifier?: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: Post, @Ctx() { updootLoader, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({ postId: post.id, userId: req.session.userId });
    return updoot ? updoot.value : null;
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // Using typeorm like this has major performance issue
    // for e.g this runs 15 sql find queries just to load the home page
    // return User.findOneBy({ id: post.creatorId });

    // so we use data loader to bacth these into single queries
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Sub, { nullable: true })
  sub(@Root() post: Post, @Ctx() { subLoader }: MyContext) {
    if (post.subId) {
      return subLoader.load(post.subId);
    }
    return null;
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req, dataSource }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const updoot = await Updoot.findOne({ where: { postId, userId } });

    // we use the transaction manager from typeorm instead of the raw sql below
    // this is in order to manage the transcation and revert it in case an error is caught on any error

    // the user has voted on the post before
    // updoot.value !== realValue check if the user is NOT repeating the same action again
    // i.e. updooting again on a post he has already updooted or downdooting on a post he has already downdooted
    // in that case we update our database
    // else in case of repeating the same action, no change is made
    if (updoot && updoot.value !== realValue) {
      await dataSource.transaction(async (tm) => {
        await tm.query(
          `
        UPDATE updoot 
        SET value = $1
        WHERE "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        // inital
        // post votes -> 1
        // on down voting we want the value to be -1 and not 0 so we substract -2 instead of -1
        // post votes -> -1

        await tm.query(
          `
        UPDATE post 
        SET points = points + $1
        WHERE id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      // has never voted before
      await dataSource.transaction(async (tm) => {
        await tm.query(
          `
        INSERT INTO updoot ("userId","postId",value)
        VALUES($1,$2,$3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
        UPDATE post
        SET points=points + $1
        WHERE id = $2
        `,
          [realValue, postId]
        );
      });
    }
    // await Updoot.insert({
    //   userId,
    //   postId,
    //   value: realValue,
    // });

    // await dataSource.query(
    //   `
    // START TRANSACTION;

    // INSERT INTO updoot ("userId","postId",value)
    // VALUES(${userId},${postId},${realValue});

    // UPDATE post
    // SET points=points + ${realValue}
    // WHERE id = ${postId};

    // COMMIT;
    // `,
    //   [realValue, postId]
    // );
  }

  // we could use the simple offset and limit approach for pagination,
  // but for a site like reddit where posts get updated very frequenty, we would run into performance issues
  // and pages could get out of sync
  // so we use the cursor based pagination
  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { dataSource }: MyContext
  ): Promise<PaginatedPosts> {
    const { realLimit, realLimitPlusOne, replacements } = parameterReplacement(limit, cursor);
    // get the items after the passed cursor

    const posts = await dataSource.query(
      `
    SELECT p.*

    FROM post p 
    
    ${cursor ? `WHERE p."createdAt" < $2` : ''}

    ORDER BY p.points DESC, p."createdAt" DESC, p."updatedAt" DESC,id

    LIMIT $1
    `,
      replacements
    );

    // get the items after the passed cursor
    // const qb = dataSource
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id=p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt"<:cursor', { cursor: new Date(parseInt(cursor)) });
    // }

    // const posts = await qb.getMany();

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => PaginatedPosts)
  async userPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Arg('username', () => String) username: string,
    @Ctx() { dataSource, req }: MyContext
  ): Promise<PaginatedPosts> {
    const { realLimit, realLimitPlusOne, replacements } = parameterReplacement(limit, cursor, username);

    const posts = await dataSource.query(
      `
    SELECT p.*

    FROM post p 

    INNER JOIN users u ON p."creatorId" = u.id WHERE u.username = $2
    
    ${cursor ? `AND p."createdAt" < $3` : ''}

    ORDER BY p."createdAt" DESC, p.points DESC, p."updatedAt" DESC,id

    LIMIT $1
    `,
      replacements
    );

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => PaginatedPosts)
  async subPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Arg('subIdentifier', () => String) subIdentifier: string,
    @Ctx() { dataSource, req }: MyContext
  ): Promise<PaginatedPosts> {
    const { realLimit, realLimitPlusOne, replacements } = parameterReplacement(limit, cursor, subIdentifier);

    const posts = await dataSource.query(
      `
    SELECT p.*

    FROM post p 

    INNER JOIN sub s ON p."subId" = s.id WHERE s."subIdentifier" = $2
    
    ${cursor ? `AND p."createdAt" < $3` : ''}

    ORDER BY p.points DESC, p."createdAt" DESC, p."updatedAt" DESC,id

    LIMIT $1
    `,
      replacements
    );

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => PaginatedPosts)
  @UseMiddleware(isAuth)
  async userFollowingSubsPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { dataSource, req }: MyContext
  ): Promise<PaginatedPosts> {
    const { realLimit, realLimitPlusOne, replacements } = parameterReplacement(limit, cursor, req.session.userId);

    const posts = await dataSource.query(
      `
    SELECT p.*

    FROM post p 

    INNER JOIN follower f ON p."subId" = f."subId" WHERE f."userId" = $2
    
    ${cursor ? `AND p."createdAt" < $3` : ''}

    ORDER BY p.points DESC, p."createdAt" DESC, p."updatedAt" DESC,id

    LIMIT $1
    `,
      replacements
    );

    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => Post, { nullable: true })
  Post(@Arg('id', () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
    const sub = input.subIdentifier ? await Sub.findOneBy({ subIdentifier: input.subIdentifier }) : null;
    return Post.create({ ...input, subId: sub?.id, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req, dataSource }: MyContext
  ): Promise<Post | null> {
    const result = await dataSource
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id AND "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning('*')
      .execute();

    return result.raw[0];
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<Boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
