"use strict";

var Query = require('../server/util/databaseUtil/SQLQuery').SQLQuery;
var expect = require('chai').expect;
var lit = require('../server/util/Literals');

describe('SQLQuery', function() {
    describe('#.getField()', function() {
        it('should return the field being operated on by the Query object', function() {
            var q = new Query(lit.tables.USER, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND);
            expect(q.getField()).to.deep.equal(lit.fields.NETVOTES);
        });

        it('should return undefined if an invalid field is passed to the constructor', function() {
            var q = new Query(lit.tables.USER, 'invalidField', lit.sql.query.EQUALS, 55, lit.sql.query.AND);
            expect(q.getField()).to.deep.equal(undefined);
        });

        it('should return undefined if an invalid table is passed to the constructor', function() {
            var q = new Query('invalidTable', lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND);
            expect(q.getField()).to.deep.equal(undefined);
        });

        it('should return undefined if an invalid table-field pair is passed to the constructor', function() {
            var q = new Query(lit.tables.TAG, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND);
            expect(q.getField()).to.deep.equal(undefined);
        });
    });

    describe('#.getJoiner()', function() {
        it('should return the joiner passed to the constructor', function() {
            var validJoiners = [lit.sql.query.AND, lit.sql.query.OR];
            var q;
            for (var joinIdx in validJoiners) {
                if (validJoiners.hasOwnProperty(joinIdx)) {
                    q = new Query(lit.tables.TAG, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, validJoiners[joinIdx]);
                    expect(q.getJoiner()).to.equal(validJoiners[joinIdx]);
                }
            }
        });

        it('should return undefined if an invalid joiner is passed in', function() {
            var q = new Query(lit.tables.TAG, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, 'badJoiner');
            expect(q.getJoiner()).to.equal(undefined);
            q = new Query(lit.tables.TAG, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, 77);
            expect(q.getJoiner()).to.equal(undefined);
            q = new Query(lit.tables.TAG, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, {});
            expect(q.getJoiner()).to.equal(undefined);
            q = new Query(lit.tables.TAG, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, []);
            expect(q.getJoiner()).to.equal(undefined);
        });
    });

    describe('#.getOperator()', function() {
        it('should return the operator passed to the constructor so long as it is valid', function() {
            const validOperators = [lit.sql.query.IN, lit.sql.query.BETWEEN, lit.sql.query.LIKE,
                lit.sql.query.EQUALS, lit.sql.query.LESS_THAN, lit.sql.query.NOT_EQUAL,
                lit.sql.query.GREATER_THAN, lit.sql.query.GREATER_THAN_OR_EQUAL_TO,
                lit.sql.query.LESS_THAN_OR_EQUAL_TO];
            var q;
            for (var opIdx in validOperators) {
                if (validOperators.hasOwnProperty(opIdx)) {
                    q = new Query(lit.tables.TAG, lit.fields.NETVOTES, validOperators[opIdx], 55, lit.sql.query.AND);
                    expect(q.getOperator()).to.equal(validOperators[opIdx]);
                }
            }
        });

        it('should return = if a bad operator is passed in', function() {
            var q = new Query(lit.tables.TAG, lit.fields.NETVOTES, "badOp", 55, lit.sql.query.AND);
            expect(q.getOperator()).to.equal(lit.sql.query.EQUALS);
            q = new Query(lit.tables.TAG, lit.fields.NETVOTES, 44, 55, lit.sql.query.AND);
            expect(q.getOperator()).to.equal(lit.sql.query.EQUALS);
            q = new Query(lit.tables.TAG, lit.fields.NETVOTES, {}, 55, lit.sql.query.AND);
            expect(q.getOperator()).to.equal(lit.sql.query.EQUALS);
            q = new Query(lit.tables.TAG, lit.fields.NETVOTES, [], 55, lit.sql.query.AND);
            expect(q.getOperator()).to.equal(lit.sql.query.EQUALS);
        });
    });

    describe('#.getQueryDataArray()', function() {
        it('should return an array of the contents of the query object', function() {
            var q = new Query(lit.tables.USER, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND);

            expect(q.getQueryDataArray()).to.deep
                .equal([lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND]);
        });

        it('should replace the invalid operator with an equals sign', function() {
            var q = new Query(lit.tables.USER, lit.fields.NETVOTES, 'invalid', 55, lit.sql.query.AND);

            expect(q.getQueryDataArray()).to.deep
                .equal([lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND]);
        });
    });

    describe('#.toString()', function() {
        it('should return a string representation of the object', function() {
            var shouldBe = "SQLQuery with body: netVotes = 55 -- with joiner: AND";
            var q = new Query(lit.tables.USER, lit.fields.NETVOTES, lit.sql.query.EQUALS, 55, lit.sql.query.AND);
            expect(q.toString()).to.equal(shouldBe);
        });
    });
});