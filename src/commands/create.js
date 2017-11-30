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

/**
 *
 * @constructor
 */
function CreateCommand(){

}

CreateCommand.prototype.execute = function(commands, args, callback) {

    let subCommand = commands[1];

    //console.log(chalk.red.bold("Executing create command...",commands, JSON.stringify(args), callback));

    if (subCommand==='module'){
        return this.executeCreateModule(commands, args, callback);
    }

    return -1;
}


CreateCommand.prototype.executeCreateModule = function(commands, args, callback) {

    //console.log(chalk.red.bold("Executing create module command...",commands, JSON.stringify(args), callback ));

    let task = new CreateModuleTask();
    task.runTask(commands, args, callback);

    /*
    let moduleName = args.name;
    let template = 'default';
    if (args.template){
        //download this template
        template = args.template;
    }

    let repoPath = this.repoPathForTemplate(template);
    if (!repoPath){
        console.log(chalk.red.bold("Unknown module template unknown: '" + template+ "'"));
        return -1;
    }

    //creating a temporary folder
    var tmpobj = tmp.dirSync();
    console.log('Dir: ', tmpobj.name);
    var tempFolder = path.join(tmpobj.name, moduleName);
    console.log("Cloning from repo " + repoPath +" ...  to '"+ tempFolder + "'");

    git()
        .clone(repoPath, tempFolder )
        .then(status => {
            console.log("Status: " , status);
            // Manual cleanup
            fs.removeSync(tmpobj.name);
        })
        .catch(err => {
            console.log("Error: " , err);
            // Manual cleanup
            fs.removeSync(tmpobj.name);
        });

    //console.log(chalk.red.bold("Executing create module: ",moduleName, template));
    */

}





// export the class
module.exports = CreateCommand;