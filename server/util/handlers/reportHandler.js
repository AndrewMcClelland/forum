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
            createReport(userID, request);
        }, function() {
            reject("User does not exist, should be logged out");
        })
    })

};

function createReport(id, request) {
    var c = new DBRow(lit.tables.REPORT);
    c.setValue(lit.fields.REPORTING_USER, id);
    c.setValue(lit.fields.REPORTED_USER, request.body.reportedUser);
    c.setValue(lit.fields.RELATED_ITEM_ID, request.body.itemID);
    c.setValue(lit.fields.REPORT_REASON, request.body.problemType);
    request.body.reason = request.body.reason ? request.body.reason : null;
    c.setValue(lit.fields.REPORT, request.body.reason);

    c.insert().then(function () {

    }, function (err) {
        log.error(err);
    })
}
