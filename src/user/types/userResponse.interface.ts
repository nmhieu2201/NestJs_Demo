import { UserType } from './user.type';

export interface UserResponseInterFace {
    user: UserType & { token: string };
}
