"use strict";

const { Router } = require(`express`);
const { getApi } = require(`../api`);

const jwtUtls = require(`../../lib/jwt`);

const { upload } = require(`../middlewares/multer`);
const csrfProtection = require(`../middlewares/csrf-protection`);

const api = getApi();

const mainRoutes = new Router();

const ARTICLES_PER_PAGE = 8;

mainRoutes.get(`/`, async (req, res, next) => {
  let { page = 1 } = req.query;
  page = +page;

  const limit = ARTICLES_PER_PAGE;
  const offset = (page - 1) * ARTICLES_PER_PAGE;

  try {
    const [{ count, articles }, categories] = await Promise.all([
      api.getArticles({ comments: true, limit, offset }),
      api.getCategories({ count: true }),
    ]);

    const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);

    return res.render(`views/main/index`, {
      articles,
      page,
      totalPages,
      categories,
    });
  } catch (err) {
    return next(err);
  }
});

mainRoutes.get(`/register`, csrfProtection, (req, res) => {
  const { user = null, validationMessages = null } = req.session;
  const csrfToken = req.csrfToken();

  req.session.user = null;
  req.session.validationMessages = null;

  return res.render(`views/main/register`, {
    user,
    validationMessages,
    csrfToken,
  });
});

mainRoutes.post(
  `/register`,
  [upload.single(`upload`), csrfProtection],
  async (req, res) => {
    const { body, file } = req;

    const user = {
      firstName: body.name,
      lastName: body.surname,
      email: body.email,
      password: body.password,
      repeatedPassword: body[`repeat-password`],
      avatar: file ? file.filename : ``,
    };

    try {
      await api.createUser(user);
      return res.redirect(`/login`);
    } catch (err) {
      req.session.user = user;
      req.session.validationMessages = err.response.data.validationMessages;

      return res.redirect(`/register`);
    }
  }
);

mainRoutes.get(`/login`, csrfProtection, (req, res) => {
  const { email, password, validationMessages } = req.session;
  const csrfToken = req.csrfToken();

  req.session.email = null;
  req.session.password = null;

  return res.render(`views/main/login`, {
    email,
    password,
    validationMessages,
    csrfToken,
  });
});

mainRoutes.post(
  `/login`,
  [upload.single(`upload`), csrfProtection],
  async (req, res) => {
    const { body } = req;

    const data = {
      email: body.email,
      password: body.password,
    };

    try {
      const accessToken = await api.loginUser(data);
      const loggedUser = jwtUtls.verifyAccessToken(accessToken);

      req.session.loggedUser = loggedUser;
      req.session.accessToken = accessToken;
      return res.redirect(`/`);
    } catch (err) {
      req.session.email = data.email;
      req.session.password = data.password;
      req.session.validationMessages = err.response.data.validationMessages;

      return res.redirect(`/login`);
    }
  }
);

mainRoutes.get(`/search`, async (req, res) => {
  try {
    const { query } = req.query;
    const results = await api.search(query);
    res.render(`views/main/search`, { searchText: query, results });
  } catch (err) {
    res.render(`views/main/search`, { searchText: ``, results: [] });
  }
});

mainRoutes.get(`/logout`, (req, res) => {
  req.session.destroy(() => res.redirect(`/login`));
});

module.exports = mainRoutes;
