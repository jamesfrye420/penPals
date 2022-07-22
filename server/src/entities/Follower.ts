import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';
import { Sub } from './Sub';
import { User } from './User';

// m to n
// many to many
// users <-> sub
// users -> join table <- sub
// users -> follower <- sub

@ObjectType()
@Entity()
export class Follower extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @PrimaryColumn()
  subId: number;

  @Field(() => Sub)
  @ManyToOne(() => Sub, (sub) => sub.followers)
  sub: Sub;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  user: User;
}
