/**
 * Created by marcobonati on 30/11/2017.
 */

const ora = require('ora');
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

    this.spinner = ora('Creating New Module...').start();

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
        let errorMsg = "Unknown module template unknown: '" + this.template+ "'";
        //console.log(chalk.red.bold(errorMsg));
        this.spinner.fail(errorMsg);
        return -1;
    }

    //creating a temporary folder
    this.prepareFolders();
    //console.log("Folders ready");

    this.spinner = this.spinner.start("Cloning from repo " + this.repoPath +"...");

    this.cloneTemplateRepo().then(() => {
        this.spinner = this.spinner.succeed("Module template clone done.");
        this.modifyModule();
        this.moveTempModule();
        this.runNpmInstall();
        this.spinner = this.spinner.succeed("Creation module done.");
        console.log("");
        console.log(chalk.green.bold("Next step are:"));
        console.log(chalk.green.bold("> cd " + this.moduleName));
        console.log(chalk.green.bold("> npm install "));
        console.log("");
        console.log("Enjoy!");
        console.log("");
        this.cleanTempFolder();
    }).catch((err) => {
        console.log("Error: ", err);
        console.log("");
        this.cleanTempFolder();
        this.spinner.fail(err);
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
    this.spinner = this.spinner.start("Preparing new module");
    let packageJsonFile = path.join(this.prjTempFolder, "package.json");
    let packageJson = jsonfile.readFileSync(packageJsonFile);
    packageJson.name = this.moduleName;
    jsonfile.writeFileSync(packageJsonFile, packageJson,   {spaces: 2, EOL: '\r\n'});
    this.spinner = this.spinner.succeed("New module prepared.");
}

CreateModuleTask.prototype.cleanTempFolder = function() {
    // Manual cleanup
    fs.removeSync(this.tempFolder);
}

CreateModuleTask.prototype.cloneTemplateRepo = function(template) {
    //Clone the repo
    return git().outputHandler((command, stdout, stderr) => {
        //stdout.pipe(process.stdout);
        //stderr.pipe(process.stderr);
    }).clone(this.repoPath, this.prjTempFolder);
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
