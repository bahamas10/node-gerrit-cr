/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var human = require('human-time');
var tabula = require('tabula');

var common = require('../common');

module.exports = changes;

// columns default without -o
var columnsDefault = [
    'id',
    'user',
    'project',
    'subject',
    'updated'
];

// columns default with -l
var columnsDefaultLong = [
    'id',
    'url',
    'user',
    'project',
    'subject',
    'changes',
    'mergeable',
    'created',
    'updated'
];

function changes(subcmd, opts, args, cb) {
    var self = this;
    var sort;

    if (opts.help) {
        self.do_help('help', {}, [subcmd], cb);
        return;
    }

    var columns = columnsDefault;
    if (opts.o) {
        columns = opts.o.split(',');
    } else if (opts.long) {
        columns = columnsDefaultLong;
    }

    if (opts.s) {
        sort = opts.s.split(',');
    }

    var listOpts;
    try {
        listOpts = common.kvToObj(args);
    } catch (e) {
        cb(e);
        return;
    }

    var user = opts.user || self.config.user;

    if (!user) {
        cb(new Error('Username must be set in the config or passed via `-u`'));
        return;
    }

    self.gerrit_client.incomingReviews(user, function (err, data) {
        if (err) {
            cb(err);
            return;
        }

        if (opts.json) {
            console.log(JSON.stringify(data, null, 2));
            cb();
            return;
        }

        data.reverse();

        // convert changes data into array
        var d = [];
        data.forEach(function (orig) {
            var subject = orig.subject;
            if (!opts.o && !opts.long) {
                subject = common.formatSubject(subject);
            }

            var o = {
                id: orig._number,
                state: orig.status,
                project: orig.project,
                subject: subject,
                user: orig.owner.username,
                created: human(common.parseDate(orig.created)),
                updated: human(common.parseDate(orig.updated)),
                changes: common.formatLinesModified(orig),
                url: self.gerrit_client.crUrl(orig._number),
                mergeable: orig.mergeable
            };
            d.push(o);
        });

        // filter based on listOpts
        d = common.filterArrayByKv(d, listOpts);

        // print the data
        tabula(d, {
            skipHeader: opts.H,
            columns: columns,
            sort: sort
        });

        cb();
    });
}

changes.options = [
    {
        names: ['help', 'h'],
        type: 'bool',
        help: 'Show this help.'
    },
    {
        names: ['user', 'u'],
        type: 'string',
        help: 'Username to use - defaults to config.user',
        helpArg: 'user'
    }
].concat(common.getCliTableOptions({
    includeLong: true
}));

changes.help = 'List all changes for a specific user\n\n{{options}}';
