/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

module.exports = projects;

function projects(subcmd, opts, args, cb) {
    var self = this;

    if (opts.help) {
        self.do_help('help', {}, [subcmd], cb);
        return;
    }

    var p = args[0];

    if (!p) {
        cb(new Error('First argument must be an API path'));
        return;
    }

    self.gerrit_client.get(p, function (err, data) {
        if (err) {
            cb(err);
            return;
        }

        console.log(JSON.stringify(data, null, 2));
        cb();
    });
}

projects.options = [
    {
        names: ['help', 'h'],
        type: 'bool',
        help: 'Show this help.'
    }
];

projects.help = 'Make an HTTP request\n\n{{options}}';
