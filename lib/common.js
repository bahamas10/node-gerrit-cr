/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var f = require('util').format;
var fs = require('fs');
var util = require('util');

var assert = require('assert-plus');

var SUBJECT_MAX_LENGTH = 60;

module.exports.getCliTableOptions = getCliTableOptions;
module.exports.kvToObj = kvToObj;
module.exports.filterArrayByKv = filterArrayByKv;
module.exports.parseDate = parseDate;
module.exports.formatSubject = formatSubject;
module.exports.formatLinesModified = formatLinesModified;

/*
 * take some basic information and return node-cmdln options suitable for
 * tabula
 *
 * @param {String} (optional) opts.columnDefault Default value for `-o`
 * @param {String} (optional) opts.sortDefault Default value for `-s`
 * @param {String} (optional) opts.includeLong Include `-l` option
 * @return {Array} Array of cmdln options objects
 *
 * taken from https://github.com/joyent/node-triton/blob/master/lib/common.js
 */
function getCliTableOptions(opts) {
    opts = opts || {};

    var o;

    // construct the options object
    var tOpts = [];

    // header
    tOpts.push({
        group: 'Output options'
    });

    // -H
    tOpts.push({
        names: ['H'],
        type: 'bool',
        help: 'Omit table header row.'
    });

    // -o field1,field2,...
    o = {
        names: ['o'],
        type: 'string',
        help: 'Specify fields (columns) to output.',
        helpArg: 'field1,...'
    };
    if (opts.columnsDefault) {
        o.default = opts.columnsDefault;
    }
    tOpts.push(o);

    // -l, --long
    if (opts.includeLong) {
        tOpts.push({
            names: ['long', 'l'],
            type: 'bool',
            help: 'Long/wider output. Ignored if "-o ..." is used.'
        });
    }

    // -s field1,field2,...
    o = {
        names: ['s'],
        type: 'string',
        help: 'Sort on the given fields.',
        helpArg: 'field1,...'
    };
    if (opts.sortDefault) {
        o.default = opts.sortDefault;
        o.help = util.format('%s Default is "%s".', o.help, opts.sortDefault);
    }
    tOpts.push(o);

    // -j, --json
    tOpts.push({
        names: ['json', 'j'],
        type: 'bool',
        help: 'JSON output.'
    });

    return tOpts;
}

/*
 * given an array of key=value pairs, break them into an object
 *
 * @param {Array} kvs - an array of key=value pairs
 *
 * taken from https://github.com/joyent/node-triton/blob/master/lib/common.js
 */
function kvToObj(kvs, opts) {
    opts = opts || {};

    // short-circuit here if stdin is allowed and `-` is passed as the first
    // argument
    if (opts.allowStdin && kvs[0] === '-') {
        return JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
    }

    var o = {};
    for (var i = 0; i < kvs.length; i++) {
        var kv = kvs[i];
        var idx = kv.indexOf('=');
        if (idx === -1) {
            throw new Error(util.format(
                'invalid filter: "%s" (must be of the form "field=value")',
                kv));
        }
        var k = kv.slice(0, idx);
        var v = kv.slice(idx + 1);

        var keys = k.split('.');
        var key;
        var _o = o;
        for (var j = 0; j < keys.length - 1; j++) {
            key = keys[j];
            _o[key] = _o[key] || {};
            _o = _o[key];
        }

        key = keys[keys.length - 1];
        if (_o[key] === undefined) {
            _o[key] = v;
        } else if (Array.isArray(_o[key])) {
            _o[key].push(v);
        } else {
            _o[key] = [_o[key], v];
        }
    }
    return o;
}

/*
 * filter an array of objects by passing in a key/value set created by
 * kvToObj
 */
function filterArrayByKv(arr, kvs) {
    // filter based on listOpts
    var filters = Object.keys(kvs);

    return arr.filter(function (o) {
        for (var i = 0; i < filters.length; i++) {
            var key = filters[i];
            if (o[key] !== kvs[key]) {
                return false;
            }
        }
        return true;
    });
}

/*
 * Parse a date string from the gerrit API
 */
function parseDate(s) {
    assert.string(s, 's');

    return new Date(s + 'Z');
}

/*
 * Remove "Approved by" and "Reviewed by" messages from the subject, as well as
 * ensure it is below SUBJECT_MAX_LENGTH
 */
function formatSubject(subject) {
    assert.string(subject, 'subject');

    subject = subject
        .split(/ Reviewed by: .*/)[0]
        .split(/ Approved by: .*/)[0];

    if (subject.length > SUBJECT_MAX_LENGTH) {
        subject = subject.substr(0, SUBJECT_MAX_LENGTH - 3) + '...';
    }

    return subject;
}

/*
 * Format inserts and deletions
 */
function formatLinesModified(obj) {
    assert.object(obj, 'obj');
    assert.number(obj.deletions, obj.deletions);
    assert.number(obj.insertions, obj.insertions);

    return f('+%d,-%d', obj.insertions, obj.deletions);
}
