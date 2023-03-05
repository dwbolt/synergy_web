/*

sync is a way to sync multiple computers

*/

//  manifest - server-side
class manifest {


//  manifest - server-side
constructor (s_configDir) {
  // native nodejs modules
  this.fsp      = require('fs/promises'); // access local file system
  this.fs       = require('fs')         ; // access local file system
  this.path     = require("path")       ;
  this.stream   = this.fs.createWriteStream( "./1-manifest.csv"   , {flags: 'a'});
  this.streamD  = this.fs.createWriteStream( "./2-dir.csv"        , {flags: 'a'});
  this.streamL  = this.fs.createWriteStream( "./3-links.csv"      , {flags: 'a'});

  // write header
  this.stream.write(`"File ID","Bytes","Disk Space","Last Access","Creation","Path"\r\n`);

  // counters
  this.totalDir   = 0;
  this.totalFiles = 0;
  this.totalLinks = 0;
}


//  manifest - server-side
async main() {
  try {
    const start = new Date();
    let dir = "/Users/davidbolt/1-topics";  // hard code for now
    this.getAllFiles(dir);
    console.log(`${this.totalDir} + ${this.totalFiles} = ${this.totalDir + this.totalFiles}`);
    console.log(`total links = ${this.totalLinks}`);
    const end = new Date();
    console.log(`duration = ${(end-start)/1000}`);
  } catch(e) {
    console.log(e);
  }
}


//  manifest - server-side
getAllFiles(dirPath) {
  const files = this.fs.readdirSync(dirPath);

  files.forEach((file) => {
    const dirFile = `${dirPath}/${file}`;
    const stat = this.fs.statSync(dirFile);

    if (stat.isSymbolicLink()) {
      this.totalLinks++;
      this.streamL.write(`"${dirFile}"\r\n`);
    }

    if (stat.isDirectory()) {
      // create csv of direcotorys
      this.streamD.write(`"${dirFile}"\r\n`);
      this.totalDir ++;
      this.getAllFiles(dirFile);
    } else {
      // assume create csv of files
      // inode,size, disk size,"last access date", creation date", "path with file name"
      this.stream.write(`${stat.ino},${stat.size},${stat.blksize*stat.blocks},"${stat.atime.toUTCString()}","${stat.birthtime.toUTCString()}","${dirFile}"\r\n`);
      this.totalFiles++;
    }
  });
}

//  serverClass - server-side
} //////// end of class

const app = new manifest();
app.main();
