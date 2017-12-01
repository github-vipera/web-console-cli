/**
 * Created by marcobonati on 30/11/2017.
 */

/**
 * Created by marcobonati on 30/11/2017.
 */
const chalk = require('chalk');
var Q = require("q");
const git = require('simple-git/promise');
var tmp = require('tmp');
var path = require('path');
const fs = require('fs-extra')
var jsonfile = require('jsonfile');
var EasyZip = require('easy-zip').EasyZip;

/**
 *
 * @constructor
 */
function PackCommand(){

}

PackCommand.prototype.execute = function(commands, args, callback) {

    this.appName = args.name;

    this.appVersion = '1.0.0';
    if (args.version){
        this.appVersion = args.version;
    }

    let distFolderExists = fs.existsSync("./dist");

    if (!distFolderExists){
        console.log(chalk.red.bold("Dist folder not found. Run 'npm run build' command before and retry."));
        return -1;
    }

    this.createDescriptor();

    this.createZip();

    return 0;
}

PackCommand.prototype.createZip= function() {

    console.log("Creating zip file...");

    var self = this;

    var zip = new EasyZip();
    zip.zipContentFolder('./dist',function(){
        zip.writeToFile('./' + self.appName + "_" + self.appVersion +".zip");
        console.log(chalk.green.bold("Pack done!"));
    });

}

PackCommand.prototype.createDescriptor = function() {

    this.descriptor = {
        "name" : this.appName,
        "version" : this.appVersion
    }

    let fileName = "./dist/descriptor.json";
    jsonfile.writeFileSync(fileName, this.descriptor,   {spaces: 2, EOL: '\r\n'});

}


EasyZip.prototype.zipContentFolder = function(folder, callback, options) {
    if(!fs.existsSync(folder)){
        callback(new Error('Folder not found'),me);
    }else{
        options = options || {};
        var me = this,
            files = fs.readdirSync(folder),
            rootFolder = options.rootFolder || path.basename(folder),
            zips = [],
            file,stat,targetPath,sourcePath;

        while(files.length > 0){
            file = files.shift();
            sourcePath = path.join(folder,file);
            targetPath = file;
            stat = fs.statSync(sourcePath);

            if(stat.isFile()){
                zips.push({
                    target : targetPath,
                    source : sourcePath
                });
            }else{
                zips.push({
                    target : targetPath
                });

                //join the path
                async.map(fs.readdirSync(sourcePath),function(item,callback){
                    callback(null,path.join(file,item));
                },function(erro,result){
                    files = files.concat(result);
                });

            }
        }

        me.batchAdd(zips,function(){callback(null,me)});

    }
}



// export the class
module.exports = PackCommand;