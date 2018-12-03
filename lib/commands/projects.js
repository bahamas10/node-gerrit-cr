/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var tabula = require('tabula');

var common = require('../common');

module.exports = projects;

// columns default without -o
var columnsDefault = 'id,state,description';

function projects(subcmd, opts, args, cb) {
    var self = this;
    var sort;

    if (opts.help) {
        self.do_help('help', {}, [subcmd], cb);
        return;
    }

    var columns = columnsDefault;
    if (opts.o) {
        columns = opts.o;
    }
    columns = columns.split(',');

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

    self.gerrit_client.listProjects(function (err, data) {
        if (err) {
            cb(err);
            return;
        }

        if (opts.json) {
            console.log(JSON.stringify(data, null, 2));
            cb();
            return;
        }

        // convert projects data into array
        var d = [];
        Object.keys(data).reverse().forEach(function (id) {
            var orig = data[id];
            var o = {
                id: id,
                state: orig.state,
                description: orig.description || ''
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

projects.options = [
    {
        names: ['help', 'h'],
        type: 'bool',
        help: 'Show this help.'
    }
].concat(common.getCliTableOptions({
    includeLong: false
}));

projects.help = 'List all projects\n\n{{options}}';
