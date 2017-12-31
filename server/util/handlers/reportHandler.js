"use strict";

var DBRow = require('./../DBRow').DBRow;
var lit = require('./../Literals');
var log = require('./../log');
var contributor = require('./../actions/Contributor');

exports.handle = function(request) {
    return new Promise(function(resolve,reject) {
        var userID = request.signedCookies.usercookie.userID;

        var u = new DBRow(lit.tables.USER);
        u.getRow(userID).then(function()
        {
            switch(request.body.type)
            {
                case("reportModal"):

                    createReport(request.body.content, u, resolve, reject);

            }
        })
    });
};

function getPage(el)
{
    el = $(el);
    el.parent().attr('id');
}

function createReport(body, user, resolve, reject) {
    var c = new DBROW(lit.tables.REPORT);
    c.setValue(lit.fields.REPORTING_USER, user.getValue(lit.FIELDS.USERNAME));
    c.setValue(lit.fields.REPORTED_USER, user.getValue(getPage(this)));
    c.setValue(lit.fields.ITEM, getPage(this));
    c.setValue(lit.fields.timestamp, new Date(today.getDate()));
    if ($('checkIC').val() == 1) {
        c.setValue(lit.fields.REPORT_REASON, 0);
        console.log(0);

    }

    if ($('checkIL').val() == 1) {
        c.setValue(lit.fields.REPORT_REASON, 1);
        console.log(1);
    }
    if ($('checkIR').val() == 1) {
        c.setValue(lit.fields.REPORT_REASON, 2);
        console.log(2);
    }
    c.insert().then(function() {

    }, function(err) {
        log.error(err);
    })
}