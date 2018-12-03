/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var fs = require('fs');
var path = require('path');
var util = require('util');

var assert = require('assert-plus');
var cmdln = require('cmdln');

var package = require('../package.json');
var GerritClient = require('../lib/gerrit-client');

var HOME_DIR = process.env.HOME ||
               process.env.HOMEPATH ||
               process.env.USERPROFILE;

// define the CLI object which includes base level options
function CLI() {
    cmdln.Cmdln.call(this, {
        name: package.name,
        desc: package.description,
        options: [
        {
            names: ['config', 'c'],
            type: 'string',
            help: 'config file - defaults to ~/.config/gerrit-cr/config.json',
            helpArg: 'CONFIG'
        },
        {
            names: ['help', 'h'],
            type: 'bool',
            help: 'print this help message and exit'
        },
        {
            names: ['url', 'U'],
            type: 'string',
            help: 'gerrit URL',
            helpArg: 'URL'
        },
        {
            names: ['version', 'v'],
            type: 'bool',
            help: 'print the version number and exit'
        }],
        helpSubcmds: [
            { group: 'General' },
            'changes',
            'incoming',
            'projects',
            { group: 'Generic Commands' },
            'get',
            'help'
        ],
    });
}
util.inherits(CLI, cmdln.Cmdln);

// called when the arguments are parsed
CLI.prototype.init = function init(opts, args, cb) {
    var self = this;

    // -v, --version
    if (opts.version) {
        console.log(package.version);
        cb(false);
        return;
    }

    // -c, --config
    var file = opts.config;
    if (!file && HOME_DIR) {
        file = path.join(HOME_DIR, '.config/gerrit-cr/config.json');
    }

    var config = {};
    if (file) {
        try {
            config = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
            // throw this error if the config file was manually set
            if (opts.config)
                throw e;
        }
    }

    assert.object(config, 'config must be an object');

    // -U <url> will override URL in config
    var url = config.url;
    if (opts.url) {
        url = opts.url;
    }
    assert.string(url, 'url');

    self.gerrit_client = new GerritClient({
        url: url
    });
    self.config = config;

    // Cmdln class handles `opts.help`.
    cmdln.Cmdln.prototype.init.apply(self, arguments);
};

// sub commands
CLI.prototype.do_changes = require('./commands/changes');
CLI.prototype.do_incoming = require('./commands/incoming');
CLI.prototype.do_projects = require('./commands/projects');

CLI.prototype.do_get = require('./commands/get');

// start the program
var cli = new CLI();
cli.main(process.argv, function (err, sbcmd) {
    if (err) {
        throw err;
    }

    process.exit(0);
});
