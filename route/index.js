// Created by Yuxi Luo, July 2018

const express = require('express');

module.exports = () => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        res.render('index');
    });

    return router;
};
