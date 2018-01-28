"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals');
var log = require('./../log');
//var contributor = require('./../actions/Contributor');


exports.handle = function(request) {
    return new Promise(function(resolve,reject) {
        var userID = request.signedCookies.usercookie.userID;

        var u = new DBRow(lit.tables.USER);
        u.getRow(userID).then(function()
        {
            createReport(request.body.content, u, resolve, reject,userID,request);
        }, function() {
            reject("User does not exist, should be logged out");
        })
    })

};



function createReport(body, user, resolve, reject,id,request) {
    var c = new DBRow(lit.tables.REPORT);
    c.setValue(lit.fields.REPORTING_USER, id);
    c.setValue(lit.fields.REPORTED_USER, 'user');
    c.setValue(lit.fields.RELATED_ITEM_ID, request.body.content.itemID);

    c.setValue(lit.fields.REPORT_REASON,request.body.content.problemType);
    c.insert().then(function() {

    }, function(err) {
        log.error(err);
    })
}