import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { User } from './decorators/user.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { UserResponseInterFace } from './types/userResponse.interface';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterFace> {
        const user = await this.userService.createUser(createUserDto);

        return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterFace> {
        const user = await this.userService.login(loginUserDto);

        return this.userService.buildUserResponse(user);
    }

    @Get('user')
    async currentUser(@User('id') user: UserEntity): Promise<UserResponseInterFace> {
        return this.userService.buildUserResponse(user);
    }
}
