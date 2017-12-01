/**
 * Created by marcobonati on 29/11/2017.
 */

const chalk = require('chalk');
var path = require('path');
var Q = require('q');
var nopt = require('nopt');
var help = require('./help');
var pkg = require('../package.json');
var CreateCommand = require('./commands/CreateCommand');
var DeployCommand = require('./commands/DeployCommand');

module.exports = function (inputArgs, cb) {


};

module.exports = function (inputArgs, cb) {

    /**
     * mainly used for testing.
     */
    cb = cb || function () {
        console.log("Command Finished!")
    };

    // If no inputArgs given, use process.argv.
    inputArgs = inputArgs || process.argv;
    var cmd = inputArgs[2]; // e.g: inputArgs= 'node wcc createmodule'
    var subcommand = getSubCommand(inputArgs, cmd);
    var isTelemetryCmd = (cmd === 'telemetry');
    var isConfigCmd = (cmd === 'config');

    if (cmd === '--version' || cmd === '-v') {
        cmd = 'version';
    } else if (!cmd || cmd === '--help' || cmd === 'h') {
        cmd = 'help';
    }


    cli(inputArgs, cb);

}


function cli (inputArgs, cb) {

    var args = nopt(knownOpts, shortHands, inputArgs);
    //console.log(args);

    process.on('uncaughtException', function (err) {
        if (err.message) {
            //logger.error(err.message);
        } else {
            //logger.error(err);
        }
        process.exit(1);
    });

    var cliVersion = require('../package').version;

    console.log('');
    console.log(chalk.blue.bold("MOTIF Web Console CLI - Vipera © 2017"));
    console.log(chalk.blue("Version " , cliVersion));
    console.log('');

    // If there were arguments protected from nopt with a double dash, keep
    // them in unparsedArgs. For example:
    // cordova build ios -- --verbose --whatever
    // In this case "--verbose" is not parsed by nopt and args.vergbose will be
    // false, the unparsed args after -- are kept in unparsedArgs and can be
    // passed downstream to some scripts invoked by Cordova.
    var unparsedArgs = [];
    var parseStopperIdx = args.argv.original.indexOf('--');
    if (parseStopperIdx !== -1) {
        unparsedArgs = args.argv.original.slice(parseStopperIdx + 1);
    }

    // args.argv.remain contains both the undashed args (like platform names)
    // and whatever unparsed args that were protected by " -- ".
    // "undashed" stores only the undashed args without those after " -- " .
    var remain = args.argv.remain;
    var undashed = remain.slice(0, remain.length - unparsedArgs.length);
    var cmd = undashed[0];
    var subcommand;


    if (!cmd || cmd === 'help' || args.help) {
        if (!args.help && remain[0] === 'help') {
            remain.shift();
        }
        return printHelp(remain);
    }

    if (cmd === 'create'){
        return new CreateCommand().execute(remain, args, cb);
    }
    if (cmd === 'deploy'){
        return new DeployCommand().execute(remain, args, cb);
    }


    return printHelp(remain);

}

function getSubCommand (args, cmd) {
    if (['platform', 'platforms', 'plugin', 'plugins', 'telemetry', 'config'].indexOf(cmd) > -1) {
        return args[3]; // e.g: args='node cordova platform rm ios', 'node cordova telemetry on'
    }
    return null;
}

function printHelp (command) {
    var result = help([command]);
    console.log(chalk.green(result));
}

var knownOpts = {
    'version': String,
    'help': Boolean,
    'name' : String,
    'template' : String,
    'description' : String,
    'offline' : Boolean,
    'remote-host' : String,
    'publish' : String,
    'user' : String,
    'passwd' : String
};

var shortHands = {
    'v': '--version',
    'h': '--help',
    't': '--template',
    'n': '--name',
    'd': '--description',
    'o': '--offline',
    'r': '--remote-host',
    'p': '--publish'
};

/*
var knownOpts = {
    'verbose': Boolean,
    'version': Boolean,
    'help': Boolean,
    'silent': Boolean,
    'experimental': Boolean,
    'noregistry': Boolean,
    'nohooks': Array,
    'shrinkwrap': Boolean,
    'copy-from': String,
    'link-to': path,
    'searchpath': String,
    'variable': Array,
    'link': Boolean,
    'force': Boolean,
    'save-exact': Boolean,
    // Flags to be passed to `cordova build/run/emulate`
    'debug': Boolean,
    'release': Boolean,
    'archs': String,
    'device': Boolean,
    'emulator': Boolean,
    'target': String,
    'browserify': Boolean,
    'noprepare': Boolean,
    'fetch': Boolean,
    'nobuild': Boolean,
    'list': Boolean,
    'buildConfig': String,
    'template': String,
    'production': Boolean,
    'noprod': Boolean
};

var shortHands = {
    'd': '--verbose',
    'v': '--version',
    'h': '--help',
    'src': '--copy-from',
    't': '--template'
};
*/