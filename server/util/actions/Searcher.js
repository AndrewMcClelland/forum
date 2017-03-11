/**
 * Created by Carson on 24/02/2017.
 * Implementation for the search function. Users enter their search terms in the search bar, and the key parts
 * are used to look through the database of posts/comments. Implements AutoTag algorithm from Algorithmia to
 * automatically get the key parts of the search terms. Note that numbers (e.g. course numbers) are not considered
 * to be words, and will need to be parsed out manually and searched for in the tags column.
 * Those words are then checked to see how relevant they
 * are to posts/comments in the database. This is done by Natural.
 *
 * need: npm install natural, npm install algorithmia
 *
 * AutoTag algorithm: https://algorithmia.com/algorithms/nlp/AutoTag
 * Natural Github: https://github.com/NaturalNode/natural
 *
 * Note: it is possible a small cost would be needed to use the AutoTag algorithm. Algorithmia credits are used to cover
 * the cost of the algorithm, which is estimated to be 11K credits per 10,000 calls. This would amount to ~1.17 USD per
 * 10,000 calls. However, for free, 5K credits are given each month, so on a small scale it is still free.
 */

//TODO more versatile search - e.g. tables, comments etc.
//TODO auto tag posts on insertion
//TODO get course numbers to search tags

//No go on better algorithm for using how important a key term is within the search, wordRelater always splits importance evenly

var natural = require("natural");
var algorithmia = require("algorithmia");
var lit = require('./../Literals.js');
var log = require('./../log.js');
var dbr = require('./../DBRow.js');

var TfIdf = natural.TfIdf;
var wordRelater = new TfIdf();

function searchForContent(inputSearch) {
    getKeyTerms(inputSearch).then(function (keyTerms) {
        return searchForPosts(keyTerms);
    }).catch(function (error) {
        log.log("searchForContent error: " + error);
    });
}

/**
 * Gets the key terms from an input String using Algoithmia Auto Tag API.
 * @param input String to get key terms from.
 * @returns {Promise} Promise as API is asynchronous. Eventually gets a String array of the key terms.
 */
function getKeyTerms(input) {
    return new Promise(function (resolve, reject) {
        algorithmia.client(lit.AUTO_TAG_API_KEY).algo(lit.AUTO_TAG_ALGORITHM).pipe(input)
            .then(function (response) {
                resolve(response.get());
            }, function (err) {
                reject(err);
            });
    });
}

/**
 * Method that searches for posts related to the parameter key terms, likely off of a user search.
 * @param keyTerms Terms that post should be check for relation to.
 * @returns {Promise} Promise as querying database is asynchronous. Eventually returns an array of post IDs,
 * sorted by most relation to the terms.
 */
function searchForPosts(keyTerms) {
    var documentInfo = [];
    var row = new dbr.DBRow(lit.POST_TABLE);
    return new Promise(function (resolve, reject) {
        row.query().then(function () {
            while (row.next()) {
                //search the post content and title
                var doc = row.getValue(lit.FIELD_TITLE) + "\n" + row.getValue(lit.FIELD_CONTENT);
                wordRelater.addDocument(doc);
                var docID = row.getValue(lit.FIELD_ID);
                var oneDoc = {measure: 0, id: docID};
                //add a row in the arrays for each document
                documentInfo.push(oneDoc);
            }
        }).then(function () {
            for (var termIndex in keyTerms) {
                wordRelater.tfidfs(keyTerms[termIndex], function (docIndex, measure) {
                    documentInfo[docIndex][lit.KEY_MEASURE] += measure;
                });
            }
            documentInfo = removeLowMeasures(documentInfo);
            resolve(sortByMeasure(documentInfo));
        }).catch(function (error) {
            log.log("searchForPosts error: " + error);
            reject(error);
        });
    });
}

/**
 * Removes documents from search consideration that have too low of a measure.
 * @param documentInfo Documents being considered.
 * @returns {*} Array with low measures moved.
 */
function removeLowMeasures(documentInfo) {
    var i = 0;
    while (i < documentInfo.length) {
        if (documentInfo[i][lit.KEY_MEASURE] < lit.MIN_RELATION_MEASURE) { //remove the posts that aren't related enough
            documentInfo.splice(i, 1);
            //counter auto continued because the array decreased one size
        } else {
            i++;
        }
    }
    return documentInfo;
}

/**
 * Sorts document info by measure, and then returns an array of the document IDs in the same order.
 * @param documentInfo document array to sort by measure.
 * @returns {Array} Sorted document IDs.
 */
function sortByMeasure(documentInfo) {
    documentInfo = mergeSort(documentInfo);
    var sortedIDs = [];
    for (var index in documentInfo) {
        log.log(documentInfo[index][lit.KEY_MEASURE]);
        sortedIDs.push(documentInfo[index][lit.FIELD_ID]);
    }
    return sortedIDs;
}

/**
 * Partitions the array being sorted by the Merge Sort algorithm.
 * @param arr Array to be sorted.
 * @returns {*} Sorted Array.
 */
function mergeSort(arr) {
    if (arr.length < 2)
        return arr;
    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);
    return merge(mergeSort(left), mergeSort(right));
}

/**
 * Merges partial arrays made by Merge Sort algorithm.
 * @param left Left array.
 * @param right Right array.
 * @returns {Array} Merged array. Eventually the fully sorted array.
 */
function merge(left, right) {
    var result = [];
    while (left.length && right.length) {
        if (left[0][lit.KEY_MEASURE] <= right[0][lit.KEY_MEASURE]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    while (left.length)
        result.push(left.shift());
    while (right.length)
        result.push(right.shift());
    return result;
}