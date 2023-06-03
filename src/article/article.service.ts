import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesReponseInterface } from './types/articlesResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
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

    async deleteArticleFromFavourite(slug: string, currentUserId: number): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ['favourites'],
        });

        const articleIndex = user.favourites.findIndex((_article) => _article.id === article.id);

        if (articleIndex >= 0) {
            user.favourites.splice(articleIndex, 1);

            article.favouritesCount--;

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

    async getFeed(currentUserId: number, query: any): Promise<ArticlesReponseInterface> {
        const follows = await this.followRepository.find({ where: { followerId: currentUserId } });

        if (follows.length === 0) {
            return {
                articles: [],
                articlesCount: 0,
            };
        }

        const followingUserIds = follows.map((f) => f.followingId);

        const queryBuilder = this.articleRepository
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')
            .where('articles.author.id IN (:...ids)', { ids: followingUserIds });

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articles = await queryBuilder.getMany();

        return { articles, articlesCount };
    }

    async findAll(currentUserId: number, query: any): Promise<ArticlesReponseInterface> {
        const queryBuilder = this.articleRepository.createQueryBuilder('articles').leftJoinAndSelect('articles.author', 'author');

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

        if (query.favourited) {
            const author = await this.userRepository.findOne({ where: { username: query.favourited }, relations: ['favourites'] });

            const ids = author.favourites.map((el) => el.id);

            if (ids.length > 0) {
                queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
            } else {
                queryBuilder.andWhere('1=0');
            }
        }

        queryBuilder.orderBy('articles.createdAt', 'ASC');

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articlesCount = await queryBuilder.getCount();

        let favouriteIds: number[] = [];

        if (currentUserId) {
            const currentUser = await this.userRepository.findOne({ where: { id: currentUserId }, relations: ['favourites'] });

            favouriteIds = currentUser.favourites.map((favourite) => favourite.id);
        }

        const articlesWithFavourited = articles.map((article) => {
            const favourited = favouriteIds.includes(article.id);

            return { ...article, favourited };
        });

        return {
            articles: articlesWithFavourited,
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
