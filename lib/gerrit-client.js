/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var f = require('util').format;

var assert = require('assert-plus');
var clients = require('restify-clients');
var jsprim = require('jsprim');

/*
 * All responses start with this string, see:
 * https://gerrit-review.googlesource.com/Documentation/rest-api.html#output
 */
var MAGIC_PREFIX = ")]}'\n";

module.exports = GerritClient;

function GerritClient(opts) {
    var self = this;

    assert.object(opts, 'opts');
    assert.string(opts.url, 'opts.url');

    var url = opts.url;

    // Remove any trailing slashes
    while (url[url.length - 1] === '/') {
        url = url.substr(0, url.length - 1);
    }
    self.gerrit_url = url;

    self.gerrit_client = clients.createStringClient({
        url: self.gerrit_url,
        accept: 'application/json'
    });
}

GerritClient.prototype.get = function get(p, cb) {
    var self = this;

    assert.string(p, 'p');
    assert.func(cb, 'cb');

    self.gerrit_client.get(p, function (err, req, res, data) {
        if (err) {
            cb(err);
            return;
        }

        assert.string(data, 'data');

        var prefix = data.substr(0, MAGIC_PREFIX.length);

        if (prefix !== MAGIC_PREFIX) {
            cb(new Error('Unexpected data received'));
            return;
        }

        data = data.substr(MAGIC_PREFIX.length);

        try {
            data = JSON.parse(data);
        } catch (e) {
            cb(e);
            return;
        }

        cb(null, data);
    });
};

GerritClient.prototype.openChanges = function openChanges(opts, cb) {
    var self = this;

    assert.object(opts, 'opts');
    assert.func(cb, 'cb');

    var query = jsprim.deepCopy(opts);

    query.is = 'open';

    var p = f('/changes/?o=DETAILED_ACCOUNTS&q=%s', formatGerritQuery(query));

    self.get(p, cb);
};

GerritClient.prototype.incomingReviews = function incomingReviews(user, cb) {
    var self = this;

    assert.string(user, 'user');
    assert.func(cb, 'cb');

    var query = {
        is: 'open',
        reviewer: user,
        '-owner': user
    };

    var p = f('/changes/?o=DETAILED_ACCOUNTS&q=%s', formatGerritQuery(query));

    self.get(p, cb);
};

GerritClient.prototype.listProjects = function listProjects(cb) {
    var self = this;

    assert.func(cb, 'cb');

    var p = '/projects/?d';

    self.get(p, cb);
};

GerritClient.prototype.crUrl = function crUrl(id) {
    var self = this;

    assert.number(id, 'id');

    return f('%s/#/c/%d/', self.gerrit_url, id);
};

function formatGerritQuery(obj) {
    assert.object(obj, obj);

    var arr = [];
    Object.keys(obj).forEach(function (key) {
        var value = obj[key];
        arr.push(f('%s:%s',
            encodeURIComponent(key),
            encodeURIComponent(value)));
    });
    return arr.join('+');
}
