import { Entity } from 'typeorm/decorator/entity/Entity';
import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';
import { Follower } from './Follower';

@ObjectType()
@Entity()
export class Sub extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  name!: string;

  @Field(() => String)
  @Column({ unique: true })
  subIdentifier!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => String)
  @Column({ type: 'int', default: 0 })
  numberOfFollowers!: number;

  @Field(() => Boolean, { nullable: true })
  followStatus: boolean | null;

  @Field()
  @ManyToOne(() => User, (user) => user.sub)
  creator: User;

  @OneToMany(() => Post, (post) => post.subId)
  posts: Post[];

  @OneToMany(() => Follower, (follower) => follower.sub)
  followers: Follower[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
