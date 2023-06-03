import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { hash } from 'bcrypt';
import { salt } from '@app/config';
import { IsEmail } from 'class-validator';
import { ArticleEntity } from '@app/article/article.entity';
@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    username: string;

    @Column({ default: '' })
    bio: string;

    @Column({ default: '' })
    image: string;

    @Column({ select: false })
    password: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, salt);
    }

    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity[];

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favourites: ArticleEntity[];
}
