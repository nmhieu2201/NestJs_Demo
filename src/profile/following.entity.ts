import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'follows' })
export class FollowingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    followerId: number;

    @Column()
    followingId: number;
}
