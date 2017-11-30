/**
 * Created by marcobonati on 30/11/2017.
 */

const chalk = require('chalk');
const simpleGit = require('simple-git');
var Q = require("q");
const git = require('simple-git/promise');
var tmp = require('tmp');
var path = require('path');
const fs = require('fs-extra');
var jsonfile = require('jsonfile');

/**
 *
 * @constructor
 */
function CreateModuleTask(){
}

CreateModuleTask.prototype.runTask= function(commands, args, callback) {

    // Check args
    this.moduleName = args.name;
    this.template = 'default';
    if (args.template){
        //download this template
        this.template = args.template;
    }

    // Get Repo URL from template name
    this.repoPath = this.repoPathForTemplate(this.template);
    if (!this.repoPath){
        console.log(chalk.red.bold("Unknown module template unknown: '" + this.template+ "'"));
        return -1;
    }

    //creating a temporary folder
    this.prepareFolders();
    //console.log("Folders ready");

    this.cloneTemplateRepo().then(status => {
        //console.log("Clone done!");
        this.modifyModule();
        this.moveTempModule();
        this.runNpmInstall();
        console.log("");
        console.log(chalk.green.bold("Creation module done."));
        console.log("");
        console.log(chalk.green.bold("Next step are:"));
        console.log(chalk.green.bold("> cd " + this.moduleName));
        console.log(chalk.green.bold("> npm install "));
        this.cleanTempFolder();
    }).catch(err => {
        console.log("Error: ", err);
        this.cleanTempFolder();
    });

    //console.log(chalk.red.bold("Executing create module: ",moduleName, template));

}



CreateModuleTask.prototype.runNpmInstall = function() {
    process.chdir('./' + this.moduleName);
    //console.log("Current folder is ", __dirname);
}

// Move the module form the temp folder to the current working dir
CreateModuleTask.prototype.moveTempModule = function() {
    fs.moveSync(this.prjTempFolder, './'+this.moduleName);
}

// Change package.json module name
CreateModuleTask.prototype.modifyModule = function() {

    let packageJsonFile = path.join(this.prjTempFolder, "package.json");
    let packageJson = jsonfile.readFileSync(packageJsonFile);
    packageJson.name = this.moduleName;
    jsonfile.writeFileSync(packageJsonFile, packageJson,   {spaces: 2, EOL: '\r\n'});

}

CreateModuleTask.prototype.cleanTempFolder = function() {
    // Manual cleanup
    fs.removeSync(this.tempFolder);
}

CreateModuleTask.prototype.cloneTemplateRepo = function(template) {
    console.log("Cloning from repo " + this.repoPath +" ...  to '"+ this.prjTempFolder  + "'");
    //Clone the repo
    return git().clone(this.repoPath, this.prjTempFolder);
}


CreateModuleTask.prototype.prepareFolders = function(template) {
    this.tempFolder = this.createTempFolder();
    //console.log('Temp Folder: ', this.tempFolder);
    this.prjTempFolder = path.join(this.tempFolder, this.moduleName);
}

CreateModuleTask.prototype.createTempFolder = function(template) {
    let tmpobj = tmp.dirSync();
    return tmpobj.name;
}

CreateModuleTask.prototype.repoPathForTemplate = function(template) {

    if (template==='default'){
        return 'https://github.com/github-vipera/web-console-module-template.git';
    } else {
        return undefined;
    }

}


// export the class
module.exports = CreateModuleTask;