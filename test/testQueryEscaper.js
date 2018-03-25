"use strict";

var expect = require('chai').expect;
var qe = require('../server/util/databaseUtil/QueryEscaper');
var lit = require('../server/util/Literals');

describe('QueryBuilder', function() {
    describe('#isValidTableName()', function() {
        it('should be able to confirm that all the tables ', function() {
            for (var tableIdx in lit.tables) {
                if (lit.tables.hasOwnProperty(tableIdx))
                    expect(qe.isValidTableName(lit.tables[tableIdx])).to.equal(true);
            }
        });

        it('should return false for an invalid table name', function() {
            expect(qe.isValidTableName('carsonisabeast')).to.equal(false);
        });
    });

    describe('#isValidFieldName()', function() {
        it('should recognize valid table-field pairs', function() {
           expect(qe.isValidField(lit.tables.USER, 'username')).to.equal(true);
        });

        it('ID should be a valid field on all tables', function() {
            for (var tableIdx in lit.tables) {
                if (lit.tables.hasOwnProperty(tableIdx))
                    expect(qe.isValidField(lit.tables[tableIdx], 'id')).to.equal(true);
            }
        });

        it('should return false when an invalid table-field pair is provided', function() {
            expect(qe.isValidField(lit.tables.POST, 'carsonroxx')).to.equal(false);
            expect(qe.isValidField('carsonrulez', lit.fields.ID)).to.equal(false);
        });
    });
});