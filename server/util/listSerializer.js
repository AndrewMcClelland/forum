/**
 * ListSerializer.js
 *
 * A functional interface for grabbing additional lists
 */

"use strict";

//TODO: add hidden handling -- or just avoid them

/** Handles requests from the list page and resolves a list of matching items for the query, or uses the Searcher functionality
 * to use more advanced query parsing. Resolves an array of JSON objects containing
 *
 * @param request: the express request from the client
 */
var DBRow = require('./DBRow').DBRow;
var lit = require('./Literals.js');
var searcher = require('./actions/Searcher');
var recursion = require('./recursion');
var itemInfo = require('./handlers/itemInfoGetter');

exports.getListPageItems = function(request, index) {
    var info = [];
    var userID = request.signedCookies.usercookie.userID;
    return new Promise(function (resolve, reject) {
        var items = new DBRow(lit.tables.ITEM);

        if (request.query.hasOwnProperty('query'))
            return useSearch(resolve, reject, request);

        if (request.query.hasOwnProperty('advanced') && request.query.advanced === "true")
            items = constructAdvancedQuery(request);
        else
            items = serializeQueryToDBRow(request.query);

        if (!items)
            return reject(false);

        items.orderBy(lit.fields.TIMESTAMP, lit.sql.query.DESC);
        items.setLimit(20);
        if (index > 0)
            items.setOffset(index * 20);

        items.query().then(function () {
            if (items.getTable() === 'item')
                recursion.recursiveGetWithVotes(resolve, reject, items, itemInfo.generalInfo, userID, [info]);
            else
                recursion.recursiveGetRowListWithVotes(resolve, reject, items, itemInfo.generalInfo, userID, [info]);
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

/**
 *
 * @param request {Object}: The express server's request
 * @return {exports.DBRow|undefined}
 */
function constructAdvancedQuery(request) {
    var row;
    var info = [[]];
    var userID = request.signedCookies.usercookie.userID;

    switch(request.query.table) {
        case ("posts"):
            //var poster = new DBRow(lit.tables.POST);

            row = new DBRow(lit.tables.POST);

            var title = request.query.postTitle;
            var tags = request.query.postTags;
            var keywords = request.query.keywords;
            var exactPhrase = request.query.exactPhrase;

            if (title)
                addCommaSeparatedStringToQuery(row, lit.fields.TITLE, title);

            if (keywords) // can be in the content, but don't have to
                addCommaSeparatedStringToQuery(row, lit.fields.CONTENT, keywords);

            if (exactPhrase)
                row.addQuery(lit.fields.CONTENT, '%' + exactPhrase + '%');

            if (tags)
                addCommaSeparatedStringToQuery(row, lit.fields.TAGS, tags);

            break;

        case ("links"):
            row = new DBRow(lit.tables.LINK);

            var link = request.query.link;
            var linkTags = request.query.linkTags;
            var linkTitle = request.query.linkTitle;

            if (linkTitle)
                addCommaSeparatedStringToQuery(row, lit.fields.TITLE, linkTitle);

            if (linkTags)
                addCommaSeparatedStringToQuery(row, lit.fields.TAGS, linkTags);

            if (link)
                row.addQuery(lit.fields.LINK, link);

            break;

        case ("classes"):
            row = new DBRow(lit.tables.CLASS);

            var classTags = request.query.classTags;
            var classTitle = request.query.classTitle;
            var courseCode = request.query.courseCode;

            if (classTags)
                addCommaSeparatedStringToQuery(row, lit.fields.TAGS, classTags);

            if (classTitle)
                addCommaSeparatedStringToQuery(row, lit.fields.TITLE, classTitle);

            if (courseCode)
                row.addQuery(lit.fields.COURSE_CODE, courseCode);

            break;

        case("users"):
            row = new DBRow(lit.tables.USER);

            var user = request.query.user;

            if (user)
                row.addQuery(lit.fields.USERNAME, user);

            break;
    }
    return row;
}

//.like wildcards for specific searches
//while loop to check if there is something in the next row
//check to see if there is a match in each row.
function addCommaSeparatedStringToQuery(rowObj, field, commaSeparatedString){
    if(commaSeparatedString === undefined)
        return;

    var keywordArr = commaSeparatedString.split(',');
    for(var index in keywordArr)
        rowObj.addOrQuery(field, lit.sql.query.LIKE, "%"+keywordArr[index]+"%")
}

/**
 *
 * @param query
 * @return {exports.DBRow}
 * //TODO: Fix tag handling (should be able to get post by tag for any item)
 */
function serializeQueryToDBRow(query) {
    var items = new DBRow(lit.tables.ITEM);
    for (var key in query) {
        //     if (query.hasOwnProperty(key))
        items.addQuery(key, lit.sql.query.LIKE, '%' + query[key] + '%');
    }
    return items;
}
