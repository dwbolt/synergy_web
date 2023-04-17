class sync {  //  sync - client-side
  /*
  this client side code shows differences between two directors (usually on different machines).  The user can then choose which files to delete or copy.

  Assume:
    dir1 and diry2 are the direcotries we are comparing
    dir1only  - delete it from dir1 or copy to dir2 
    both- nothing or delete both
    dir2only  - delte it from dir2 or copy to dir1

  Process:
    mainifest files are created for dir1 and di2 that contain a list of all files.  The lists are comppared and create sets:
      walk all files in dir1 and its subdirectories
      both     -> if file is in dir2, remove from dir2 index
      dir1only -> if not in dir2    , remove from dir2 index
      dir2only -> what is left in dir2 index after walking all files in dir1 
  */


constructor ( //  sync - client-side
) {
  this.dir1           ; // will contain table object for local machine
  this.dir2           ; // will contain table object for remote machine
  this.pathIndex  = 6 ; // index in CSV file where path is
  this.modifyDate = 4 ; // index in CSV file where modifyDate is
}


async fetch(   //  sync - client-side  - starting point
) {  // upload from local machine to server, at end server should have same version of files as local
  this.start = new Date()    ;  // see how long it runs
  await this.generateLocal() ;  // create mainifest files for local machine
  await this.generateRemote();  // same for remote machine
  this.compareInit();        ;  // initialize variables for repeated calls to compare every second until all files in dir1 have been compared to dir2.
                             ;  // we stop work every second so status information can be updated
}


compareInit(){  //  sync - client-side
  this.i     = 0;     // index into dir1 data, need this since we restart loop every sencond
 
  // data structure that holds lists of files
  this.tags      = {
    "dir1"      : {
       "only"    : []  // array of indexes to files only in dir1
      ,"both"    : []  // array of indexes in dir1 that are also in dir2
      ,"newer"   : []  // subset of both where dir1.modifydate is newer than dir2.modifydate
    } 
    ,"dir2"      : {
       "only" : []  // array of indexes to files only in dir2
       ,"both"    : []  // array of indexes in dir1 that are also in dir2
       ,"newer"   : []  // subset of both where dir1.modifydate is newer than dir2.modifydate
    }};
  this.index = {};  // will contian list files only in dir2 - starts with all file is dir2, every file dir1 is deleted from index, what is left are files only in dir2
 
  // setup for calling this.compare
  this.dir1 = app.db.getTable("1-manifest.csv-local"); 
  this.dir2 = app.db.getTable(`1-manifest.csv-${this.serverResp.machine}`);

  // init index with all files in dir2
  for(let i=0; i<this.dir2.json.rows.length; i++) {
    this.index[  this.dir2.json.rows[i][this.pathIndex]  ] = i; 
  }

  // display tables
  app.tableUx.setModel( app.db, "1-manifest.csv-local" );
  app.tableUx.display();

  this.compare();  // start the campare process
}


async generateLocal() {  //  sync - client-side
   // generate mainifest files on dir1 server
   let msg = `{
    "server"      : "sync"
    ,"method"     : "manifest"
    ,"user"       : "${localStorage.getItem("user")}"
    ,"type"       : "client2server"
    ,"location"   : "local"
  }`
  this.serverResp = await app.proxy.postJSON(msg,"https://synergyalpha.sfcknox.org");   // assume local server is always https://synergyalpha.sfcknox.org

  if (this.serverResp.msg) {
    // list of all files created
    document.getElementById("status").innerHTML = "files generated on local server";
  } else {
    // user was not added
    alert(`User add Failed,${JSON.stringify(this.serverResp)}`);
    return;
  }

  // load local server mainifest files so the can be displayed
  for ( var i=0; i< this.serverResp.files.length; i++ ) {
      let file = this.serverResp.files[i];
      await this.loadLocalServer(this.serverResp.machine, file, `${file}-local`);
  };
}


async generateRemote(){  //  sync - client-side
   // generate mainifest files on logedin server (remote)
  msg = `{
    "server"      : "sync"
    ,"method"     : "manifest"
    ,"type"       : "client2server"
    ,"location"   : "remote"
  }`
  this.serverResp = await app.proxy.postJSON(msg,"/users");     // geting logged in user space
  if (this.serverResp.msg) {
    // list of all files created
    document.getElementById("status").innerHTML = "\nfiles generated on remote server";
  } else {
    alert("Did not generated on logged in server");
    return;
  }

  // load maniftest files from remote server
  for ( var i=0; i< this.serverResp.files.length; i++ ) {
    let file = this.serverResp.files[i];
    await this.loadRemoteServer(this.serverResp.machine, file, `${file}-${this.serverResp.machine}`);
  };
}

compare(  //  sync - client-side
// keep calling walk until all files on dir1 have been checked to see if they live in dir2
// main work of method, find which files are only in one directory or are in both
) {
  const r   = this.dir1.json.rows;
  const rr  = this.dir2.json.rows;

  // walk local file list for displayStatus itterations
  for (let now=new Date(); this.i < r.length && new Date()-now<1000; this.i++) {   // display status every second
    // main work of method, find which files are only in one directory or are in both
    let dir2Index = this.index[r[this.i][this.pathIndex]];
    if (typeof(dir2Index) === 'number' ) {
      // the file path is in both dir1 and dir2
      this.tags.dir1.both.push(this.i);                 // add to dir1.both
      this.tags.dir2.both.push(dir2Index);              // add to dir2.both
      delete this.index[r[this.i][this.pathIndex]];     // delete from dir2only

      // see which version is newer   
      let d1 = new Date(r[    this.i][this.modifyDate]);  
      let d2 = new Date(rr[dir2Index][this.modifyDate]);
      if ( d1 > d2) {
        this.tags.dir1.newer.push(this.i);     // newer version of file in dir1, so add to tag
      } else if (d1 < d2) {
        this.tags.dir2.newer.push(dir2Index);  // newer version of file in dir2, so add to tag
      }
    } else {
      // add to dir1only
      this.tags.dir1.only.push(this.i);     
    }
  };

  // display status every second
  document.getElementById("status").innerHTML = `
  elasped time = ${(new Date() - this.start)/1000} Seconds
  
  ${this.i} 1-manifest.csv-local rows processed

  ${r.length} 1-manifest.csv-local 
  ${this.tags.dir1.only.length     } only
  ${this.tags.dir1.both.length     } both
  ${this.tags.dir1.newer.length    } newer

  ${rr.length}  1-manifest.csv-${this.serverResp.machine} 
  ${Object.keys(this.index).length } only
  ${this.tags.dir2.both.length     } both
  ${this.tags.dir2.newer.length    } newer
  `  

  if (this.i <r.length) {
    // more work todo, start again in 1 millisec
    setTimeout( this.compare.bind(this), 1 );
  } else {
    // done, create tag from index
     Object.keys(this.index).forEach((key, index) => {
        this.tags.dir2.only.push( this.index[key] );
    });

    // add tags to tables
    app.tags["1-manifest.csv-local"]                      = this.tags.dir1;
    app.tags[`1-manifest.csv-${this.serverResp.machine}`] = this.tags.dir2;
  
    // display data with updated tags
    app.tableUx.tags  = app.tags["1-manifest.csv-local"];
    app.tableUx.statusLine();
  }
}


async loadLocalServer( //  sync - client-side
        // loads local manifest file
   machine             // local machine name
  ,fileName            // file we are loading
  ,tableName=fileName
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  const file   = await app.proxy.getText(`https://synergyalpha.sfcknox.org/syncUserLocal/sync/${machine}/${fileName}`);

  csv.parseCSV(file, "status");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


async loadRemoteServer( //  sync - client-side
  // load remote manifest file
   machine                // remote machine name
  ,fileName               //  file to be loaded
  ,tableName=fileName     // lable to appear in menue
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  //const file   = await app.proxy.getText(`/users/sync/${this.machine}/${fileName}.csv`);
  const file   = await app.proxy.getText(`/users/sync/${machine}/${fileName}`);

  csv.parseCSV(file, "status");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


///////////////////////////////////////////  methods to suppoort push from local to remote
async pull(  //  sync - client-side
  // download files from server
){ //  sync - client-side
  document.getElementById("status"). innerHTML = "download dir2 only files"  // clear out status line
  await this.download("only", );  // download dir2 only files

  document.getElementById("status"). innerHTML += "\n\ndownload dir2 newer files\n"
  await this.download("newer");  // upload dir1 newer files to server

  //document.getElementById("status"). innerHTML += "\n\ndelete dir1 only\n"
 // await this.delete("only")   // delete dir2 only

  alert("pull complete");
}


async push(  //  sync - client-side
  // upload local files that are missing or newer than the the ones on the server
){ //  sync - client-side
  document.getElementById("status"). innerHTML = "Upload dir1 only files"  // clear out status line
  await this.upload("only","post" );  // upload dir1 only  files to server

  document.getElementById("status"). innerHTML += "\n\nUpload dir1 newer files\n"
  await this.upload("newer","put");  // upload dir1 newer files to server

  //document.getElementById("status"). innerHTML += "\n\ndeleted dir2 files that are not one dir1\n"
  //await this.delete("only")   // delete dir2 only

  alert("push complete");
}


async delete( //  sync - client-side
  dir    // directory
  ,tag   // tag name 
  ) {
  const rows = this[dir].json.rows;
  let server="";  // default is machine logged into
  if (dir==="dir1") {
    server="https://synergyalpha";   // switch to local server
  }

  document.getElementById("status"). innerHTML = ""  // clear status line
  for ( let i=0; i < this.tags[dir][tag].length; i++ ) {
    // get file name to upload
    let dirIndex   = this.tags[dir][tag][i]; 
    let file2delete = rows[dirIndex][this.pathIndex];  // file path relative to userdata with file name
  
    const resp = await app.proxy.RESTdelete(`${server}/users${file2delete}`);  // deletre file on server
    document.getElementById("status"). innerHTML += `${i} - ${file2delete}\n`;      // update status
  };
}

  
async upload(//  sync - client-side
  tag  // upload files pointed to by dir1[tag] 
  ,method="post"   // post -> it is a new resoure, err if already there, put -> update/replace resouce with new version
  ) {  
  const rows = this.dir1.json.rows;
  for ( let i=0; i < this.tags.dir1[tag].length; i++ ) {
    // get file name to upload
    let dir1Index   = this.tags.dir1[tag][i]; 
    let file2Upload = rows[dir1Index][this.pathIndex];  // file path relative to userdata with file name
  
    // get local server file
    let fileData = await app.proxy.getText(`https://synergyalpha.sfcknox.org/syncUserLocal${file2Upload}`)
  
    let resp = await app.proxy.RESTpost(fileData,`/users${file2Upload}`,method);  // save file to server
    if (true) {
      //resp = await app.proxy.RESTpatch(msg,`/users${file2Upload}`);  // update creationan and modify date to match original file
    }

      // update status
     document.getElementById("status"). innerHTML += `${i} - ${file2Upload}\n`;
  };
}


}//  sync - client-side  //////// end of cass
