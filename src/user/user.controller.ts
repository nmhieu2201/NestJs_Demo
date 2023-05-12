import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { UserResponseInterFace } from './types/userResponse.interface';
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
}
