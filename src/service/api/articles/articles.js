"use strict";

const { Router } = require(`express`);
const { HTTP_CODE } = require(`../../../constants`);
const { articleValidator, articleExist } = require(`../../middlewares`);

module.exports = (api, articleService, commentsRouter) => {
  const route = new Router();
  api.use(`/articles`, route);

  route.use(
    `/:articleId/comments`,
    articleExist(articleService),
    commentsRouter
  );

  route.get(`/`, async (req, res) => {
    const categories = await articleService.findAll();
    return res.status(HTTP_CODE.OK).json(categories);
  });

  route.post(`/`, articleValidator, async (req, res) => {
    const article = await articleService.create(req.body);

    return res.status(HTTP_CODE.CREATED).json(article);
  });

  route.get(`/:articleId`, articleExist(articleService), async (req, res) => {
    const { article } = res.locals;

    return res.status(HTTP_CODE.OK).json(article);
  });

  route.put(
    `/:articleId`,
    [articleExist(articleService), articleValidator],
    async (req, res) => {
      const { article } = res.locals;
      const updatedArticle = await articleService.update(article.id, req.body);

      return res.status(HTTP_CODE.OK).json(updatedArticle);
    }
  );

  route.delete(
    `/:articleId`,
    articleExist(articleService),
    async (req, res) => {
      const { article } = res.locals;
      const deletedArticle = await articleService.delete(article.id);

      return res.status(HTTP_CODE.OK).json(deletedArticle);
    }
  );
};