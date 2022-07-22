import { MyContext } from '../types';
import { Arg, Ctx, ObjectType, Query, Resolver } from 'type-graphql';

@ObjectType()
@Resolver()
export class SearchResolver {
  @Query(() => [String], { nullable: true })
  async search(@Arg('keyword', () => String) keyword: string, @Ctx() { dataSource }: MyContext) {
    // you should sanitize the user input
    // using express-sanitize-input or node-sanitize
    const results = await dataSource.query(
      // `
      //   SELECT results FROM
      //   (
      //     (SELECT 'r/' || s."subIdentifier" AS results ,
      //     LEVENSHTEIN(s."subIdentifier",${"'" + keyword + "'"}) FROM sub s)

      //     UNION

      //     (SELECT 'u/' || u."username" AS results ,
      //     LEVENSHTEIN(u."username",${"'" + keyword + "'"}) FROM users u)
      //   ) as FOO

      //   ORDER BY LEVENSHTEIN ASC

      //   LIMIT 10
      //     `
      `
        SELECT results FROM
        (
          (SELECT 'r/' || s."subIdentifier" AS results ,
          LEVENSHTEIN(s."subIdentifier",$1) FROM sub s)

          UNION

          (SELECT 'u/' || u."username" AS results ,
          LEVENSHTEIN(u."username",$1) FROM users u)
        ) as FOO

        ORDER BY LEVENSHTEIN ASC

        LIMIT 10
          `,
      [keyword]
    );

    return results.map((result: any) => result.results);
  }
}

// select results from ((SELECT 'r/' || s."subIdentifier" as results,LEVENSHTEIN(s."subIdentifier",'dan') from sub s ) UNION
// (SELECt 'u/' || u."username" as results,LEVENSHTEIN(u."username",'dan') from "users" u ))
// as foo  order by LEVENSHTEIN asc ;
