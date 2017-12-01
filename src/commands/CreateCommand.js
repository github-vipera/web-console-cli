/**
 * Created by marcobonati on 30/11/2017.
 */
const chalk = require('chalk');
var Q = require("q");
const git = require('simple-git/promise');
var tmp = require('tmp');
var path = require('path');
const fs = require('fs-extra')

var CreateModuleTask = require("./create/CreateModuleTask");
var CreateConsoleTask = require("./create/CreateConsoleTask");

/**
 *
 * @constructor
 */
function CreateCommand(){

}

CreateCommand.prototype.execute = function(commands, args, callback) {

    let subCommand = commands[1];

    if (subCommand==='module'){
        return this.executeCreateModule(commands, args, callback);
    }
    else if (subCommand==='console'){
        return this.executeCreateConsole(commands, args, callback);
    }

    return -1;
}

CreateCommand.prototype.executeCreateConsole = function(commands, args, callback) {

    let task = new CreateConsoleTask();
    task.runTask(commands, args, callback);

}

CreateCommand.prototype.executeCreateModule = function(commands, args, callback) {

    //console.log(chalk.red.bold("Executing create module command...",commands, JSON.stringify(args), callback ));

    let task = new CreateModuleTask();
    task.runTask(commands, args, callback);

}





// export the class
module.exports = CreateCommand;