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
}

async mainifestUpload(   //  sync - client-side
) {  // upload from local machine to server, at end server should have same version of files as local
  this.start = new Date();  // see how long it runs
  this.i     = 0;        // index into dir1 data, need this since we restart loop every 10,000 files
 
  // data structure that holds lists of files
this.tags      = {
    "dir1"      : {
       "only"    : []  // array of indexes to files only in dir1
      ,"both"    : []  // array of indexes in dir1 that are also in dir2
    } 
    ,"dir2"      : {
       "only" : []  // array of indexes to files only in dir2
    }};
  this.index = {};  // will contian list files only in dir2, used to build this.tags.dir2.only
  this.dir1;  // will contain table object
  this.dir2;  // will contain table object

  // generate mainifest files on dir1 server
  let msg = `{
    "server"      : "sync"
    ,"method"        : "manifest"
    ,"user"       : "${localStorage.getItem("user")}"
    ,"type"       : "client2server"
    ,"location"   : "local"
  }`
  this.serverResp = await app.proxy.postJSON(msg,"https://synergyalpha.sfcknox.org");   // assume local server is always https://synergyalpha.sfcknox.org

  if (this.serverResp.msg) {
    // list of all files created
    document.getElementById("json").innerHTML = "files generated on local server";
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
    document.getElementById("json").innerHTML = "\nfiles generated on remote server";
  } else {
    alert("Did not generated on logged in server");
    return;
  }

  // load maniftest files from remote server
  for ( var i=0; i< this.serverResp.files.length; i++ ) {
    let file = this.serverResp.files[i];
    await this.loadRemoteServer(this.serverResp.machine, file, `${file}-${this.serverResp.machine}`);
  };

  // setup for calling this.walk
  this.dir1 = app.db.getTable("1-manifest.csv-local"); 
  this.dir2 = app.db.getTable(`1-manifest.csv-${this.serverResp.machine}`);

  // init index
  for(let i=0; i<this.dir2.json.rows.length; i++) {
    this.index[  this.dir2.json.rows[i][5]  ] = i;  // inext 5 is file name with full path
  }

  // display
  app.tableUx.setModel( app.db, "1-manifest.csv-local" );
  app.tableUx.display();

  this.walk();

  app.tags["1-manifest.csv-local"]                 = this.tags.dir1;
  app.tags[`1-manifest.csv-${this.serverResp.machine}`] = this.tags.dir2;

  app.tableUx.tags  = app.tags["1-manifest.csv-local"];
  app.tableUx.statusLine();
}


walk(  //  sync - client-side
// keep calling walk until all files on dir1 have been checked to see if they live in dir2
// main work of method, find which files are only in one directory or are in both
) {
  const r   = this.dir1.json.rows;
  const rr  = this.dir2.json.rows;

  // walk local file list for displayStatus itterations
  for (let now=new Date(); this.i < r.length && new Date()-now<1000;this.i++) {   // display status every second
    // main work of method, find which files are only in one directory or are in both
    if (typeof(this.index[r[this.i][5]]) === 'number' ) {
      // r[this.i][5] fileName
      this.tags.dir1.both.push(this.i);     // add to both
      delete this.index[r[this.i][5]];     // delete from dir2only
    } else {
      this.tags.dir1.only.push(this.i);     // add to dir1only
    }
  };

  // display status every second
  document.getElementById("json").innerHTML = `
  elasped time = ${(new Date() - this.start)/1000} Seconds
  
  ${this.i} 1-manifest.csv-local rows processed
  ${r.length} 1-manifest.csv-local 
  
  ${rr.length}  1-manifest.csv-${this.serverResp.machine} 
  
  ${this.tags.dir1.only.length     } 1-manifest.csv-local only
  ${this.tags.dir1.both.length     } 1-manifest.csv-local both
  ${ Object.keys(this.index).length} 1-manifest.csv-${this.serverResp.machine} only 
  `  

  if (this.i <r.length) {
    // more work todo, start again in 1 millisec
    setTimeout( this.walk.bind(this), 1 );
  } else {
    // done, create tag from indexe - do not think this will work
     Object.keys(this.index).forEach((key, index) => {
        this.tags.dir2.only.push( this.index[key] );
    });

  }
}


async loadLocalServer( //  sync - client-side
   machine
  ,fileName
  ,tableName=fileName
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  const file   = await app.proxy.getText(`https://synergyalpha.sfcknox.org/user/${localStorage.getItem("user")}/sync/${machine}/${fileName}`);

  csv.parseCSV(file, "json");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


async loadRemoteServer( //  sync - client-side
   machine                // remote machine name
  ,fileName               //  file to be loaded
  ,tableName=fileName     // lable to appear in menue
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  //const file   = await app.proxy.getText(`/users/sync/${this.machine}/${fileName}.csv`);
  const file   = await app.proxy.getText(`/users/sync/${machine}/${fileName}`);

  csv.parseCSV(file, "json");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}



uploadDir1Only(){
  // 
    var only = this.tags.dir1.only;
    only.forEach( index => {
    var file=this.dir1.json.rows[index]
    document.getElementById("json").innerHTML = "uploadDir1Only";
    this.tag.dir2.only.push( this.index[key] );
    });
  }

}//  sync - client-side  //////// end of cass
