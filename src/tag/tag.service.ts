import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
    findAll(): string[] {
        return ['dragon', 'coffe', 'weather'];
    }
}
