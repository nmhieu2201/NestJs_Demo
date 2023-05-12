import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterFace } from './types/userResponse.interface';
import { compare } from 'bcrypt';
// import { validate } from 'class-validator';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const { email, username } = createUserDto;

        const userByEmail = await this.userRepository.findOne({ where: { email: email } });

        const userByUsername = await this.userRepository.findOne({ where: { username: username } });

        if (userByEmail || userByUsername) {
            throw new HttpException('Email or username already used', HttpStatus.BAD_REQUEST);
        }
        const newUser = new UserEntity();

        Object.assign(newUser, createUserDto);

        return await this.userRepository.save(newUser);
    }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const { email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: { email: email },
            select: ['id', 'username', 'email', 'bio', 'password', 'image'],
        });

        if (!user) {
            throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const isPassword = await compare(loginUserDto.password, user.password);

        if (!isPassword) {
            throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        delete user.password;

        return user;
    }

    generateJwt(user: UserEntity): string {
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            JWT_SECRET,
        );
    }

    buildUserResponse(user: UserEntity): UserResponseInterFace {
        return {
            user: {
                ...user,
                token: this.generateJwt(user),
            },
        };
    }
}
