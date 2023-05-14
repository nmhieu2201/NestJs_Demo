import { JWT_SECRET } from '@app/config';
import { ExpressInterface } from '@app/types/expressRequest.interface';
import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UserService } from '../user.service';
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}
    async use(req: ExpressInterface, _: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            req.user = null;
            next();
            return;
        }

        const token = req.headers.authorization.split('')[1];
        console.log('token', token);

        try {
            const decode = verify(token, JWT_SECRET);
            console.log('decode', decode);
            const user = await this.userService.findById(decode.id);
            req.user = user;
            next();
        } catch (err) {
            req.user = null;
            next();
        }
    }
}
