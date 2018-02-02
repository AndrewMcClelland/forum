/**
 * login.js
 *
 * Contains login middleware for the express server
 *
 * Written by Michael Albinson 1/28/18
 */

"use strict";

exports.loginRedirect = function(req, res, next) {
    if ((req.signedCookies.usercookie === undefined) && !req.url.includes('/login')) {
        if (req.url === '/')
            return res.redirect('/login');

        return res.redirect('/login?redirect=' + req.url);
    }

    next();
};