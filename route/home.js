// Created by Yuxi Luo, July 2018

const express = require('express');
const indexRouter = require('./index');

module.exports = () => {
    const router = express.Router();

    router.use('/', indexRouter());
    router.get('/about', (req, res, next) => {
        res.render('about');
    });

    return router;
};
