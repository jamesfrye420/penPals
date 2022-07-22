import { Field, InputType } from 'type-graphql';

// Input types cannot be returned and only used for input

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
