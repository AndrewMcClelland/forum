/*
** linkAuthentication.js
** Created by Krishna Iyer 12/23/17
*
** Aunthenticates links posted by users on the forum
*/

"use strict";
exports.handle = function (url) {
    return new Promise(function(resolve,reject){
            //get the required modules
            var SafeBrowse = require('node-safe-browse');
            var api = new SafeBrowse.Api(/*Put API key here*/);

            //Check if link is safe
            api.lookup(url)
                .on('success', function (data) {
                    resolve(url);
                })
                .on('error', function (error) {
                    var warning = new Error('This link is not safe!');
                    reject(warning);
                });
        });
};








