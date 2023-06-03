import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get(':username')
    async getProfile(@User('id') currenUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.getProfile(currenUserId, profileUsername);

        return this.profileService.buildProfileResponse(profile);
    }

    @Post(':username/follow')
    @UseGuards(AuthGuard)
    async followProfile(@User('id') currenUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.followProfile(currenUserId, profileUsername);

        return this.profileService.buildProfileResponse(profile);
    }

    @Delete(':username/follow')
    @UseGuards(AuthGuard)
    async unfollowProfile(@User('id') currenUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {
        const profile = await this.profileService.unfollowProfile(currenUserId, profileUsername);

        return this.profileService.buildProfileResponse(profile);
    }
}
