import { ArticleEntity } from '../article.entity';

export class ArticlesReponseInterface {
    articles: ArticleEntity[];
    articlesCount: number;
}
