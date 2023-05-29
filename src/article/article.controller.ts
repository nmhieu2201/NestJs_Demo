import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesReponseInterface } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleControler {
    constructor(private readonly articleService: ArticleService) {}

    @Get()
    async findAll(@User('id') currentUserId: number, @Query() query: any): Promise<ArticlesReponseInterface> {
        return await this.articleService.findAll(currentUserId, query);
    }

    @Post()
    @UseGuards(AuthGuard)
    async create(@User() currentUser: UserEntity, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser, createArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

    @Get(':slug')
    async getSingleArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.findBySlug(slug);

        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(@User('id') currentUserId: number, @Param('slug') slug: string) {
        return this.articleService.deleteArticle(slug, currentUserId);
    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
        @Body('article') updateArticleDto: CreateArticleDto,
    ) {
        const article = await this.articleService.updateArticle(slug, currentUserId, updateArticleDto);

        return this.articleService.buildArticleResponse(article);
    }

    @Post(':slug/favourite')
    @UseGuards(AuthGuard)
    async addArticleToFavourite(@User('id') currentUserId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articleService.addArticleToFavourite(slug, currentUserId);

        return this.articleService.buildArticleResponse(article);
    }
}
