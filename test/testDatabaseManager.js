"use strict";

var expect = require('chai').expect;
var dbm = require('../server/util/databaseUtil/DatabaseManager');

describe('DatabaseManager', function() {

    describe('#query()', function() {
        var deleted = false;
        it('should respond with a single, simple object containing "some text"', function() {
            var queryString = "select 'some text' as ''";
            return dbm.query(queryString, false).then(function(rows) {
                expect(rows).to.deep.equal([ { '': 'some text' } ]);
            });
        });

        it('should insert a row into the vote table and return the row', function() {
            var queryString = "INSERT INTO vote (id, itemID, userID, voteValue) VALUES ('dbm1', '4', '5', 0)";
            return dbm.query(queryString, false).then(function(rows) {
                expect(rows.affectedRows).to.equal(1);
            });
        });

        it('should update the row from the last test', function() {
            var queryString = "UPDATE vote SET voteValue=1 WHERE id='dbm1'";
            return dbm.query(queryString, false).then(function(rows) {
                expect(rows.affectedRows).to.equal(1);
            });
        });

        it('should retrieve the row inserted in the first test', function() {
            var queryString = "SELECT * FROM vote WHERE id='dbm1'";
            return dbm.query(queryString, false).then(function(rows) {
                expect(rows.length).to.equal(1);
                expect(rows[0]).to.deep.equal({'itemID': '4', 'userID': '5', 'voteValue': 1, 'id': 'dbm1'})
            });
        });

        it('should delete the row from the last two tests', function() {
            var queryString = "DELETE FROM vote WHERE id='dbm1'";
            return dbm.query(queryString, false).then(function(rows) {
                expect(rows.affectedRows).to.equal(1);
                deleted = true;
            });
        });

        after(function() {
            if (!deleted)
                dbm.query("DELETE FROM vote WHERE id=\'dbm1\'"); // delete the row we use for testing even if there's an error

            dbm.kill();
        });
    });

    describe('#kill()', function() {
        it('should prevent us from querying once the database manager is killed', function() {
            dbm.kill();

            return dbm.query("select 'some text' as ''").catch(function(err) {
                expect(err).not.equal(undefined);
            })
        });
    });

    describe('#useDB()', function() {
        it('should connect to the testing database after the pool is killed', function() {
            dbm.kill();
            return dbm.useDB('testing').then(function() {
                return dbm.query("select 'some text' as ''").then(function(rows) {
                    expect(rows).to.deep.equal([ { '': 'some text' } ]);
                });
            });
        });

        after(function() {
            dbm.kill();
        })
    });
});