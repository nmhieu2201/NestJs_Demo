import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { User } from './decorators/user.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { UserResponseInterFace } from './types/userResponse.interface';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    @UsePipes(new BackendValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterFace> {
        const user = await this.userService.createUser(createUserDto);

        return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new BackendValidationPipe())
    async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterFace> {
        const user = await this.userService.login(loginUserDto);

        return this.userService.buildUserResponse(user);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async currentUser(@User() user: UserEntity): Promise<UserResponseInterFace> {
        return this.userService.buildUserResponse(user);
    }

    @Put('user')
    @UseGuards(AuthGuard)
    async updateCurrenUser(@User('id') currentUserId: number, @Body('user') updateUserDto: UpdateUserDto): Promise<UserResponseInterFace> {
        const user = await this.userService.updateUser(currentUserId, updateUserDto);
        return this.userService.buildUserResponse(user);
    }
}
