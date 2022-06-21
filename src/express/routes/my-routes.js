"use strict";

const { Router } = require(`express`);
const { getApi } = require(`../api`);

const isUserAdmin = require(`../middlewares/is-user-admin`);

const api = getApi();

const myRoutes = new Router();

myRoutes.use(isUserAdmin);

myRoutes.get(`/`, async (req, res) => {
  const articles = await api.getArticles();
  return res.render(`views/my/index`, { articles });
});

myRoutes.get(`/comments`, async (req, res) => {
  const articles = await api.getArticles({ comments: true });
  return res.render(`views/my/comments`, { articles: articles.slice(0, 3) });
});

myRoutes.get(`/categories`, async (req, res) => {
  const categories = await api.getCategories();
  return res.render(`views/my/categories`, { categories });
});

module.exports = myRoutes;
