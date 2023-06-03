import { UserEntity } from '@app/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowingEntity } from './following.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, FollowingEntity])],
    controllers: [ProfileController],
    providers: [ProfileService],
})
export class ProfileModule {}
