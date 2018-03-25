"use strict";

var expect = require('chai').expect;
var DBRow = require('../server/util/DBRow').DBRow;
var lit = require('../server/util/Literals');
var dbm = require('../server/util/databaseUtil/DatabaseManager');

describe('DBRow', function() {
    before(function() {
        // these are for querying against
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test1', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test2', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test3', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test4', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test5', '4', '5', 1)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test6', '4', '5', 1)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test7', '4', '5', 1)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr_test8', '4', '5', 1)");

        // these are for the delete tests
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr1', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr2', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr3', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr4', '4', '5', 0)");
        dbm.query("INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbr5', '4', '5', 0)");
    });

    after(function() {
        // delete everything with ids prefixed by dbr
        return dbm.query("DELETE FROM vote WHERE id LIKE 'dbr%'").then(function() {
            dbm.kill()
        });
    });

    describe('#.addOrQuery()', function() {
        it('should add the OR query to the DBRow', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.addOrQuery(lit.fields.VOTE_VALUE, 1);
            row.addOrQuery(lit.fields.ID, 'xyz451');
            row.addOrQuery(lit.fields.ITEM_ID, 'xxxx4444');
            expect(row.toString()).to.equal("Unqueried DBRow with 3 query(ies)");
        });

        it('should be able to mix with .addQuery()', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.addOrQuery(lit.fields.VOTE_VALUE, 1);
            row.addQuery(lit.fields.ID, 'xyz451');
            row.addOrQuery(lit.fields.ID, 'xxxx4444');
            row.addQuery(lit.fields.ITEM_ID, 'thisIsACoolRow');
            expect(row.toString()).to.equal("Unqueried DBRow with 4 query(ies)");
        });

        it('should be undefined if no table is passed to the DBRow', function() {
            var row = new DBRow();
            expect(row.addOrQuery).to.equal(undefined);
        });
    });

    describe('#.addQuery()', function() {
        it('should add the specified query to the row', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.addQuery(lit.fields.VOTE_VALUE, 1);
            row.addQuery(lit.fields.ID, 1);
            row.addQuery(lit.fields.ITEM_ID, 1);
            expect(row.toString()).to.equal("Unqueried DBRow with 3 query(ies)");
        });

        it('should be undefined if no table is passed to the DBRow', function() {
            var row = new DBRow();
            expect(row.addQuery).to.equal(undefined);
        });
    });

    describe('#.getTable()', function() {
        it('should return the table of a given DBRow', function() {
            var table = lit.tables.USER;
            var dbr = new DBRow(table);
            expect(dbr.getTable()).to.equal(table);
        });

        it('should allow an invalid table through.. but the query will fail', function() {
            var table = 'notARealTable';
            var dbr = new DBRow(table);
            expect(dbr.getTable()).to.equal(table);
        });

        it('should fail if no table is provided to the DBRow', function() {
            var dbr = new DBRow();
            // getTable will not be a function of DBRow if table not specified -> it will be undefined
            expect(dbr.getTable).to.equal(undefined);
        });
    });

    describe('#.toString()', function() {
        it('should return the default string if nothing has been done to the row', function() {
            var dbr = new DBRow(lit.tables.VOTE);
            expect(dbr.toString()).to.equal("New DBRow Object, no queries, values or rows");
        });

        it('should return the correct number of queries that have been attached to the row', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.addQuery(lit.fields.VOTE_VALUE, 1);
            row.addQuery(lit.fields.ID, 1);
            expect(row.toString()).to.equal("Unqueried DBRow with 2 query(ies)")
        });

        it('should return a serialized string of all the values set to the row (1)', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.setValue(lit.fields.VOTE_VALUE, 1);
            row.setValue(lit.fields.ID, 1);
            expect(row.toString()).to.equal("Uninserted DBRow with current object: {\"voteValue\":1,\"id\":1}");
        });

        it('should return a serialized string of all the values set to the row (2)', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.setValue(lit.fields.VOTE_VALUE, 1);
            row.setValue(lit.fields.ID, "zyx");
            row.setValue(lit.fields.ITEM_ID, "xyz");
            expect(row.toString()).to.equal("Uninserted DBRow with current object: " +
                "{\"voteValue\":1,\"id\":\"zyx\",\"itemID\":\"xyz\"}");
        });

        it('should return with the number of rows and the current index', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.addQuery(lit.fields.ID, lit.sql.query.LIKE, 'dbr_test%');
            return row.query().then(function() {
                expect(row.toString()).to
                    .equal("Queried DBRow object with 8 rows. Current row index is -1");
                row.next();
                expect(row.toString()).to
                    .equal("Queried DBRow object with 8 rows. Current row index is 0");
            });
        });
    });

    describe('#.setValue()', function() {
        it('should set the values to the current row', function() {
            var row = new DBRow(lit.tables.VOTE);
            row.setValue(lit.fields.ID, 'helloThisIsAGr8Test');
            expect(row.getRowJSON()).to.deep.equal({ 'id': 'helloThisIsAGr8Test' });
        });

        it('should set the values to the current row -- more complex', function() {
            var row = new DBRow(lit.tables.USER);
            row.setValue(lit.fields.USERNAME, 'carsonPulls');
            row.setValue(lit.fields.NETVOTES, 1000);
            row.setValue(lit.fields.TOTAL_UPVOTES, 2000);
            row.setValue(lit.fields.TOTAL_DOWNVOTES, 1000);
            row.setValue(lit.fields.PRIVILEGE, "DoIT");
            expect(row.getRowJSON()).to.deep.equal({
                username: "carsonPulls",
                netVotes: 1000,
                totalUpvotes: 2000,
                totalDownvotes: 1000,
                privilege: "DoIT"
            });
        });

        it('should fail if no table is provided to the DBRow', function() {
            var dbr = new DBRow();
            // getTable will not be a function of DBRow if table not specified -> it will be undefined
            expect(dbr.setValue).to.equal(undefined);
        });
    })
});