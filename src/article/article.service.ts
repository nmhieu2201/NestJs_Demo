import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesReponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) {}

    async addArticleToFavourite(slug: string, currentUserId: number): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ['favourites'],
        });

        const isNewFavorite = user.favourites.findIndex((_article) => _article.id === article.id) === -1;

        if (isNewFavorite) {
            user.favourites.push(article);

            article.favouritesCount++;

            await this.userRepository.save(user);

            await this.articleRepository.save(article);
        }

        return article;
    }

    private getSlug(title: string): string {
        return slugify(title, { lower: true }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
    }

    async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = new ArticleEntity();

        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = this.getSlug(createArticleDto.title);

        article.author = currentUser;

        return await this.articleRepository.save(article);
    }

    async findAll(currentUserId: number, query: any): Promise<ArticlesReponseInterface> {
        const queryBuilder = await this.articleRepository.createQueryBuilder('articles').leftJoinAndSelect('articles.author', 'author');

        const articles = await queryBuilder.getMany();

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}`,
            });
        }

        if (query.author) {
            const author = this.userRepository.findOne({
                where: { username: query.author },
            });

            queryBuilder.andWhere('articles.authorId = :id', {
                id: (await author).id,
            });
        }

        queryBuilder.orderBy('articles.createdAt', 'ASC');

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articlesCount = await queryBuilder.getCount();

        return {
            articles,
            articlesCount,
        };
    }

    async findBySlug(slug: string): Promise<ArticleEntity> {
        return await this.articleRepository.findOne({ where: { slug: slug } });
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.findBySlug(slug);

        if (!article) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.delete({ slug });
    }

    async updateArticle(slug: string, currentUserId: number, updateArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        if (!article) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        Object.assign(article, updateArticleDto);

        return this.articleRepository.save(article);
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }
}
