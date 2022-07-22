import { Field, InputType } from 'type-graphql';

// Input types cannot be returned and only used for input

@InputType()
export class SubDetailsInput {
  @Field()
  name: string;
  @Field()
  subIdentifier: string;
}
