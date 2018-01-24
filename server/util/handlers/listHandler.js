/*
 * listHandler.js
 * Written by Michael Albinson 2/15/17
 *
 * Logic for handling requests from the list page.
 */

"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals.js');
var log = require('./../log');
var searcher = require('./../actions/Searcher');
var recursion = require('./../recursion');
var itemInfo = require('./itemInfoGetter');

//TODO: add hidden handling -- or just avoid them

/** Handles requests from the list page and resolves a list of matching items for the query, or uses the Searcher functionality
 * to use more advanced query parsing. Resolves an array of JSON objects containing
 *
 * @param request: the express request from the client
 */
exports.handle = function (request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    return new Promise(function (resolve, reject) {
        var items = new DBRow(lit.tables.ITEM);

        if (request.query.hasOwnProperty('query'))
            return useSearch(resolve, reject, request);

        if (request.query.hasOwnProperty('advanced') && request.query.advanced === "true")
            return executeAdvanced(resolve, reject, request);

        for (var key in request.query)
            items.addQuery(key, lit.sql.query.LIKE, '%' + request.query[key] + '%'); //TODO: Fix tag handling (should be able to get post by tag for any item)

        items.orderBy(lit.fields.TIMESTAMP, lit.sql.query.DESC);
        items.setLimit(20);
        items.query().then(function () {
            recursion.recursiveGetWithVotes(resolve, reject, items, itemInfo.generalInfo, userID, [info]);
        }).catch(function () {
            reject(false);
        });
    });
};

/** Uses the Searcher's searchForContent function parse a search query string to build the list page's information array.
 *
 * @param resolve: The handle function's resolution
 * @param reject: The handle function's rejection
 * @param request: The express server's request
 */
function useSearch(resolve, reject, request) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    searcher.searchForContent(request.query.query).then(function (res) {
        recursion.recursiveGetListWithVotes(resolve, reject, res[0], res[1], itemInfo.generalInfo, userID, [info], 0);
    }).catch(function (err) {
        reject(err);
    });
}


function executeAdvanced(resolve, reject, request) {
    var info = [[]];
    var userID = request.signedCookies.usercookie.userID;

    //var title = request.query.titleContains;
    var table = request.query.table;
    //var tags = request.query.tags;
    //var keywords = request.query.keywords;
    //var exactPhrase = request.query.exactPhrase;

    if(table === "posts") {
        var postTitle = request.query.postTitle;
        var postTags = request.query.postTags;
        var keywords = request.query.keywords;
        var exactPhrase = request.query.exactPhrase;

        var posts = new DBRow(lit.tables.POST);

        if (postTitle) //
            addCommaSeparatedStringToQuery(posts, lit.fields.TITLE, postTitle);

        if (keywords) // can be in the content, but don't have to
            addCommaSeparatedStringToQuery(posts, lit.fields.CONTENT, keywords);

        if (exactPhrase) // must be in the content somewhere
            posts.addQuery(lit.fields.CONTENT, '%'+exactPhrase+'%');

        if (postTags) // must be in the tag field
            addCommaSeparatedStringToQuery(posts, lit.fields.TAGS, postTags);

        posts.query().then(function() {
            recursion.recursiveGetRowListWithVotes(resolve, reject, posts, itemInfo.generalInfo, userID, info)
        }).catch(function(err, message){
            console.log('err receiving rows');
            console.log(err);
            console.log(message);
            reject();
        });

    }

    // will not work, there is no CONTENT field on link
    if(table === "links"){
        var link = request.query.link;
        var linkTags = request.query.linkTags;
        var linkTitle = request.query.linkTitle;

        var links = new DBRow(lit.tables.LINK);

        if (linkTitle) //
            addCommaSeparatedStringToQuery(links, lit.fields.TITLE, linkTitle);

        if (linkTags) // must be in the tag field
            addCommaSeparatedStringToQuery(links, lit.fields.TAGS, linkTags);

        if (link)
            links.addQuery(lit.fields.LINK, link);


        links.query().then(function() {
            recursion.recursiveGetRowListWithVotes(resolve, reject, links, itemInfo.generalInfo, userID, info)
        }).catch(function(err, message){
            console.log('err receiving rows');
            console.log(err);
            console.log(message);
            reject();
        });
    }

    // will not work, the class table does not have most of these fields
    if(table === "classes"){

        var classTags = request.query.classTags;
        var classTitle = request.query.classTitle;
        var courseCode = request.query.courseCode;

        var classer = new DBRow(lit.tables.CLASS);

        if (classTags)
            addCommaSeparatedStringToQuery(classer, lit.fields.TAGS, classTags);

        if (classTitle)
            addCommaSeparatedStringToQuery(classer, lit.fields.TITLE, classTitle);

        if (courseCode)
            classer.addQuery(lit.fields.COURSE_CODE, courseCode);


        classer.query().then(function() {
            recursion.recursiveGetRowListWithVotes(resolve, reject, classer, itemInfo.generalInfo, userID, info)
        }).catch(function(err, message){
            console.log('err receiving rows');
            console.log(err);
            console.log(message);
            reject();
        });
    }

    // will not work at all, the user table does not have any of these tags
    if(table === "user"){

        var user = request.query.user;

        var userer = new DBRow(lit.tables.USER);

        if (user)
            userer.addQuery(lit.fields.USERNAME, user);

        userer.query().then(function() {
            recursion.recursiveGetRowListWithVotes(resolve, reject, userer, itemInfo.generalInfo, userID, info)
        }).catch(function(err, message){
            console.log('err receiving rows');
            console.log(err);
            console.log(message);
            reject();
        });
    }

        /*userer.query().then(function() {
            if(!userer.next()){
                return console.log("nothing");
            }
            while(userer.next){
                userer.addQuery(lit.fields.TITLE, title);
                userer.addQuery(lit.fields.CONTENT, keywords);
                userer.addQuery(lit.fields.CONTENT, lit.sql.query.LIKE, "%"+ exactWords +"%");
                userer.addQuery(lit.fields.TAGS, lit.sql.query.LIKE, "%"+ tags +"%");
            }
        }, function(err) {
            console.log("No rows match, error");
            reject(false);
        });

    }*/
}


//.like wildcards for specific searches
//while loop to check if there is something in the next row
//check to see if there is a match in each row.
function addCommaSeparatedStringToQuery(rowObj, field, commaSeparatedString){
    if(commaSeparatedString === undefined)
        return;

    var keywordArr = commaSeparatedString.split(',');
    for(var index in keywordArr)
        rowObj.addQuery(field, lit.sql.query.LIKE, "%"+keywordArr[index]+"%")
}