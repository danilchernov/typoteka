'use strict';

const {Router} = require(`express`);
const articlesRoutes = new Router();

articlesRoutes.get(`/category/:id`, (req, res) => res.render(`views/articles/articles-by-category`));
articlesRoutes.get(`/add`, (req, res) => res.render(`views/articles/editor`));
articlesRoutes.get(`/edit/:id`, (req, res) => res.render(`views/articles/editor`));
articlesRoutes.get(`/:id`, (req, res) => res.render(`views/articles/article`));

module.exports = articlesRoutes;

