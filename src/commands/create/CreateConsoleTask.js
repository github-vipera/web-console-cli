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
const replaceInFile = require('replace-in-file');

/**
 *
 * @constructor
 */
function CreateConsoleTask(){
}

CreateConsoleTask.prototype.runTask= function(commands, args, callback) {

    this.spinner = ora('Creating New Console App...').start();

    // Check args
    this.consoleName = args.name;
    this.description = "";
    if (args.description){
        //console app description
        this.description = args.description;
    }
    this.template = 'default';
    if (args.template){
        //download this template
        this.template = args.template;
    }

    // Get Repo URL from template name
    this.repoPath = this.repoPathForTemplate(this.template);
    if (!this.repoPath){
        let errorMsg = "Unknown console template unknown: '" + this.template+ "'";
        //console.log(chalk.red.bold(errorMsg));
        this.spinner.fail(errorMsg);
        return -1;
    }

    //creating a temporary folder
    this.prepareFolders();
    //console.log("Folders ready");

    this.spinner = this.spinner.start("Cloning from repo " + this.repoPath +"...");

    this.cloneTemplateRepo().then(status => {
        this.spinner = this.spinner.succeed("Console template clone done.");
        this.modifyModule();
        this.moveTempModule();
        this.runNpmInstall();
        console.log("");
        this.spinner = this.spinner.succeed("Creation console done.");
        console.log("");
        console.log(chalk.green.bold("Next steps are:"));
        console.log(chalk.green.bold("> cd " + this.consoleName));
        console.log(chalk.green.bold("> npm install "));
        console.log(chalk.green.bold("> npm run start "));
        console.log("");
        console.log("Enjoy!");
        console.log("");
        this.cleanTempFolder();
    }).catch(err => {
        console.log("Error: ", err);
        console.log("");
        this.cleanTempFolder();
        this.spinner.fail(err);
    });

    //console.log(chalk.red.bold("Executing create module: ",moduleName, template));

}



CreateConsoleTask.prototype.runNpmInstall = function() {
    process.chdir('./' + this.consoleName);
    //console.log("Current folder is ", __dirname);
}

// Move the module form the temp folder to the current working dir
CreateConsoleTask.prototype.moveTempModule = function() {
    fs.moveSync(this.prjTempFolder, './'+this.consoleName);
}

// Change package.json module name
CreateConsoleTask.prototype.modifyModule = function() {

    // Update the package.json file
    this.spinner = this.spinner.start("Preparing new console");
    let packageJsonFile = path.join(this.prjTempFolder, "package.json");
    let packageJson = jsonfile.readFileSync(packageJsonFile);
    packageJson.name = this.consoleName;
    jsonfile.writeFileSync(packageJsonFile, packageJson,   {spaces: 2, EOL: '\r\n'});

    /*
    // Update the .angular-cli.json file
    let angularCliJsonFile = path.join(this.prjTempFolder, ".angular-cli.json");
    let angularCliJson = jsonfile.readFileSync(angularCliJsonFile);
    angularCliJson.project.name = this.consoleName;
    jsonfile.writeFileSync(angularCliJsonFile, angularCliJson,   {spaces: 2, EOL: '\r\n'});
    */

    // Update the angular.json file
    this.updateAngularJsonFile();     
   
    // Update the webconsole.descriptor.json file
    let webConsoleDescriptorJsonFile = path.join(this.prjTempFolder, "webconsole.descriptor.json");
    let webConsoleDescriptorJson = jsonfile.readFileSync(webConsoleDescriptorJsonFile);
    webConsoleDescriptorJson.name = this.consoleName;
    webConsoleDescriptorJson.description = this.description;
    jsonfile.writeFileSync(webConsoleDescriptorJsonFile, webConsoleDescriptorJson,   {spaces: 2, EOL: '\r\n'});

    this.spinner = this.spinner.succeed("New console prepared.");
}

CreateConsoleTask.prototype.updateAngularJsonFile = function() {

    let angularJsonFile = path.join(this.prjTempFolder, "angular.json");

    const options = {
        files: angularJsonFile,
        from: /web-console-template/g,
        to: this.consoleName,
      };
      
      try {
        const changes = replaceInFile.sync(options);
        console.log('Modified files:', changes.join(', '));
      }
      catch (error) {
        console.error('Error occurred:', error);
      }
}

CreateConsoleTask.prototype.cleanTempFolder = function() {
    // Manual cleanup
    fs.removeSync(this.tempFolder);
}

CreateConsoleTask.prototype.cloneTemplateRepo = function(template) {
    //Clone the repo
    return git().outputHandler((command, stdout, stderr) => {
        //stdout.pipe(process.stdout);
        //stderr.pipe(process.stderr);
    }).clone(this.repoPath, this.prjTempFolder);
}


CreateConsoleTask.prototype.prepareFolders = function(template) {
    this.tempFolder = this.createTempFolder();
    //console.log('Temp Folder: ', this.tempFolder);
    this.prjTempFolder = path.join(this.tempFolder, this.consoleName);
}

CreateConsoleTask.prototype.createTempFolder = function(template) {
    let tmpobj = tmp.dirSync();
    return tmpobj.name;
}

CreateConsoleTask.prototype.repoPathForTemplate = function(template) {

    if (template==='default'){
        return 'https://github.com/github-vipera/web-console-template.git';
    } else {
        return undefined;
    }

}


// export the class
module.exports = CreateConsoleTask;
