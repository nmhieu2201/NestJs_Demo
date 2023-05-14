import { UserEntity } from '@app/user/user.entity';
import { Request } from 'express';

export interface ExpressInterface extends Request {
    user?: UserEntity;
}
