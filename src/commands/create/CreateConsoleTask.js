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
const inquirer = require('inquirer');
const parse5 = require('parse5');
const jp = require('jsonpath');

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
        this.spinner.fail(errorMsg);
        return -1;
    }

    //creating a temporary folder
    this.prepareFolders();

    this.spinner = this.spinner.start("Cloning from repo " + this.repoPath +"...");

    this.cloneTemplateRepo().then(status => {
        this.spinner = this.spinner.succeed("Console template clone done.");

        this.spinner = this.spinner.start("Preparing new console");
        this.modifyModule().then(()=>{
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

            this.spinner = this.spinner.succeed("New console prepared.");

        }, (error)=>{

            console.log(chalk.red.bold("Error: ", error));
            console.log("");
            this.cleanTempFolder();
            this.spinner.fail(err);

        });

    }).catch(err => {
        console.log(chalk.red.bold("Error: ", err));
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

    return new Promise((resolve, reject)=>{

        this.updatePackageJsonFile().then(()=>{

            // Update the angular.json file
            this.updateAngularJsonFile().then(()=>{

                // Update the Console Descriptor JSON file 
                this.updateConsoleDescriptorJsonFile().then(()=>{
                    
                    this.updateHTML().then(()=>{
                        resolve();
                    }, (error)=>{
                        reject(error);
                    });

                }, (error)=>{
                    reject(error);
                });
    
            }, (error)=>{
                reject(error);
            })     
    
        }, (error)=>{
            reject(error);
        });
    
    });


}

CreateConsoleTask.prototype.updateHTML = function() {

    return new Promise((resolve,reject)=>{

        var questions = [
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of your new console:'
            }
        ];

        this.spinner = this.spinner.stop();

        inquirer.prompt(questions).then( (answers) => {

            //update the HTML content
            let indexHtmlFile = path.join(this.prjTempFolder, "src", "index.html");
            const options = {
                files: indexHtmlFile,
                from: '<title>Demo</title>',
                to: '<title>'+answers.title+'</title>',
            };
            try {
                const changes = replaceInFile.sync(options);
                console.log('Modified files:', changes.join(', '));
                resolve();
            } catch (error) {
                console.error('Error occurred:', error);
                reject(error);
            }
 
        }, (error)=>{
            reject(error);
        });

    });
}

CreateConsoleTask.prototype.loadHTML = function(file) {
    var contents = fs.readFileSync(file, 'utf8');
    const document = parse5.parse(contents);
    return document;
}


CreateConsoleTask.prototype.updateConsoleDescriptorJsonFile = function() {

    return new Promise((resolve,reject)=>{
        // Update the webconsole.descriptor.json file
        let webConsoleDescriptorJsonFile = path.join(this.prjTempFolder, "webconsole.descriptor.json");
        let webConsoleDescriptorJson = jsonfile.readFileSync(webConsoleDescriptorJsonFile);
        webConsoleDescriptorJson.name = this.consoleName;
        webConsoleDescriptorJson.description = this.description;
        jsonfile.writeFileSync(webConsoleDescriptorJsonFile, webConsoleDescriptorJson,   {spaces: 2, EOL: '\r\n'});
        resolve();
    });
}

CreateConsoleTask.prototype.updatePackageJsonFile = function() {

    return new Promise((resolve, reject)=>{

        // Update the package.json file
        let packageJsonFile = path.join(this.prjTempFolder, "package.json");
        let packageJson = jsonfile.readFileSync(packageJsonFile);
        packageJson.name = this.consoleName;
        jsonfile.writeFileSync(packageJsonFile, packageJson,   {spaces: 2, EOL: '\r\n'});
        
        resolve();
    });
}

CreateConsoleTask.prototype.updateAngularJsonFile = function() {

    return new Promise((resolve,reject)=>{

        //Replace all names
        let angularJsonFile = path.join(this.prjTempFolder, "angular.json");
        const options = {
            files: angularJsonFile,
            from: /web-console-template/g,
            to: this.consoleName,
        };
        try {
            const changes = replaceInFile.sync(options);
            console.log('Modified files:', changes.join(', '));
        } catch (error) {
            console.error('Error occurred:', error);
            reject(error);
        }
        
        // Enable Proxy if needed

        this.updateAngularJsonFileForProxy().then(()=>{
            resolve();
        }, (error)=>{
            reject(error);
        });

    });

}

CreateConsoleTask.prototype.updateAngularJsonFileForProxy = function(angularJsonFile) {

    var myPromise = new Promise((resolve, reject)=>{

        var questions = [
            {
                type: 'confirm',
                name: 'proxyEnabled',
                message: 'Do you want to add proxy support in your project?',
                default: false
            },
            {
                type: 'input',
                name: 'proxyIP',
                message: 'Enter the ip address of your MOTIF:',
                when: function(answers) {
                    return answers.proxyEnabled;
                }
            },
            {
                type: 'input',
                name: 'proxyPort',
                message: 'Enter the port number of your MOTIF:',
                when: function(answers) {
                    return answers.proxyEnabled;
                }
            },
            {
                type: 'input',
                name: 'proxyScheme',
                message: 'Enter the URL scheme:',
                default: "http",
                when: function(answers) {
                    return answers.proxyEnabled;
                }
            }
        ];

        this.spinner = this.spinner.stop();

        inquirer.prompt(questions).then( (answers) => {

            try {
                if (answers.proxyEnabled){
                    
                    // Update the json file
                    let packageJsonFile = path.join(this.prjTempFolder, "angular.json");
                    let packageJson = jsonfile.readFileSync(packageJsonFile);
                    packageJson.projects[this.consoleName].architect.serve.options["proxyConfig"] = "./proxy.conf.json";
                    jsonfile.writeFileSync(packageJsonFile, packageJson,   {spaces: 2, EOL: '\r\n'});


                    // Update proxy settings
                    let proxyJsonFile = path.join(this.prjTempFolder, "proxy.conf.json");
                    let proxyJson = jsonfile.readFileSync(proxyJsonFile);
                    proxyJson["/rest"].target = answers.proxyScheme +"://" + answers.proxyIP + ":" + answers.proxyPort;
                    proxyJson["/oauth"].target = answers.proxyScheme +"://" + answers.proxyIP + ":" + answers.proxyPort;
                    jsonfile.writeFileSync(proxyJsonFile, proxyJson,   {spaces: 2, EOL: '\r\n'});

                } else {

                    //do nothings
                }

                resolve();
                
            } catch (ex){
                console.error('Error occurred:', ex);
                this.spinner = this.spinner.fail("Error: " + ex);
                reject(ex);
            }
        });
    
    });

    return myPromise;

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
