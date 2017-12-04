/**
 * Created by marcobonati on 04/12/2017.
 */

const ora = require('ora');
const chalk = require('chalk');
var Q = require("q");
const git = require('simple-git/promise');
var tmp = require('tmp');
var path = require('path');
const fs = require('fs-extra')
var jsonfile = require('jsonfile');
const { spawn } = require('child_process');
const runScript = require('runscript');


/**
 *
 * @constructor
 */
function ServeCommand(){

}

ServeCommand.prototype.execute = function(commands, args, callback) {

    let cmd = 'npm  ';
    //cmd = 'ls'

    this.spinner = ora('Serving Console App...').start();

    /**
    const child = spawn(cmd);

    child.stdout.on('data', (data) => {
        console.log(`child stdout:\n${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`child stderr:\n${data}`);
    });

    child.on('exit', (code, signal) =>{
        console.log('child process exited with ' +
            `code ${code} and signal ${signal}`);
        callback();
        this.spinner.stop();
    });
     **/

    runScript('npm run start', { stdio: 'pipe' })
        .then(stdio => {
            console.log(stdio.stdout.toString());
        })
        .catch(err => {
            console.error(err);
        });




}

// export the class
module.exports = ServeCommand;