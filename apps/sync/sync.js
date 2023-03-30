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

uploadDir1Only(){
// 
  var only = this.tags.dir1.only;
  only.forEach( index => {
  var file=this.dir1.json.rows[index]
  document.getElementById("json").innerHTML = "uploadDir1Only";
  this.tag.dir2.only.push( this.index[key] );
});


}

async mainifestUpload(   //  sync - client-side
) {  // upload from local machine to server, at end server should have same version of files as local
  this.start = new Date();  // see how long it runs
  this.i        = 0;        // index into dir1 data, need this since we restart loop every 10,000 files
 
  // data structure that holds lists of files
  this.tags      = {
    "dir1"      : {
      "only" : []  // array of indexes to files only in dir1
      ,"both"    : []  // array of indexes in dir1 that are also in dir2
    } 
    ,"dir2"      : {
       "only" : []  // array of indexes to files only in dir2
    }};

    this.dir1;  // will contain table object
    this.dir2;  // will contain table object

  this.index = {};  // will contian list files only in dir2, used to build this.tags.dir2.only

  // generate mainifest files on dir1 server
  let msg = `{
    "server"      : "sync"
    ,"msg"        : "manifest"
    ,"user"       : "${localStorage.getItem("user")}"
    ,"type"       : "client2server"
    ,"location"   : "local"
  }`
  let serverResp = await app.proxy.postJSON(msg,"http://127.0.0.1/sync");   // assume local server is always https://synergyalpha.sfcknox.org
  if (serverResp.msg) {
    // list of all files created
    document.getElementById("json").innerHTML = "files generated on local server";
  } else {
    // user was not added
    alert(`User add Failed,${JSON.stringify(serverResp)}`);
    return;
  }

  // load local server mainifest files so the can be displayed
  for ( var i=0; i< serverResp.files.length; i++ ) {
      let file = serverResp.files[i];
      await this.loadLocalServer(serverResp.machine, file, `${file}-local`);
  };
  // generate mainifest files on logedin server (remote)
 msg = `{
    "server"      : "sync"
    ,"msg"        : "manifest"
    ,"type"       : "client2server"
    ,"direcotry"  : "upload"
    ,"location"   : "remote"
  }`
  serverResp = await app.proxy.postJSON(msg,"/users/sync/client2server");     // geting logged in user space
  if (serverResp.msg) {
    // list of all files created
    document.getElementById("json").innerHTML = "\nfiles generated on remote server";
  } else {
    alert("Did not generated on logged in server");
    return;
  }

  // load maniftest files from remote server
  for ( var i=0; i< serverResp.files.length; i++ ) {
    let file = serverResp.files[i];
    await this.loadRemoteServer(serverResp.machine, file, `${file}-remote`);
  };

  this.dir1 = app.db.getTable("1-manifest-local"); 
  this.dir2 = app.db.getTable("1-manifest-remote");

  // init index
  for(let i=0; i<this.dir2.json.rows.length; i++) {
    this.index[ dir2.json.rows[i][5]  ] = i;  // inext 5 is file name with full path
  }

  // display
  app.tableUx.setModel( app.db, "1-manifest-local" );
  app.tableUx.display();

  this.walk();
  app.tableUx.tags.both  = this.tags.dir1.both;
  app.tableUx.tags.only  = this.tags.dir1.only;
  app.tableUx.statusLine();
}


walk(  //  sync - client-side
// keep calling walk until all files on dir1 have been checked to see if they live in dir2
) {
  const r   = this.dir1.json.rows;
  const rr  = this.dir2.json.rows;
  const displayStatus = 10000;  // display status after this many rows are looked at

  // walk local file list for displayStatus itterations
  for (let i=0; this.i < r.length && i < displayStatus; this.i++) {
    i++; // loop counting
    // use indexes
    if (typeof(this.index[r[this.i][5]]) === 'number' ) {
      // r[this.i][5] fileName
      this.tags.dir1.both.push(this.i);     // add to both
      delete this.index[r[this.i][5]];      // delete from dir2only
    } else {
      this.tags.dir1.only.push(this.i);     // add to dir1only
    }
  };

  // display status
  document.getElementById("json").innerHTML = `
  elasped time = ${(new Date() - this.start)/1000} Seconds

  Dir1 files      = ${this.i} of ${r.length}
  Dir2 files      = ${rr.length}

  Both            = ${this.tags.dir1.both.length     }
  Dir1 only       = ${this.tags.dir1.only.length     }
  Dir2 only       = ${ Object.keys(this.index).length}
  `  

  if (this.i <r.length) {
    // more work todo, start again in 10 millisec
    setTimeout( app.diff.walk.bind(this), 10 );
  } else {
    // done, create tag from indexe - do not think this will work
     Object.keys(this.index).forEach((key, index) => {
        this.tag.dir2.only.push( this.index[key] );
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
  const file   = await app.proxy.getText(`https://synergyalpha.sfcknox.org/users/sync/${machine}/${fileName}`);

  csv.parseCSV(file, "json");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


async loadRemoteServer( //  sync - client-side
  fileName
  ,tableName=fileName
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  //const file   = await app.proxy.getText(`/users/sync/${this.machine}/${fileName}.csv`);
  const file   = await app.proxy.getText(`/users/sync/client2server/${fileName}.csv`);

  csv.parseCSV(file, "json");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


async main(   //  sync - client-side
) {  // started from button in app.html
  this.start = new Date();  // see how long it runs

  // generate files on local machine
  const msg = `{
    "server"      : "web"
    ,"msg"        : "sync"
  }`
  const serverResp = await app.proxy.postJSON(msg,"https://synergyalpha.sfcknox.org");
  if (serverResp.msg) {
    // list of all files created
    alert("files generated on local server")
  } else {
    // user was not added
    alert(`User add Failed,${JSON.stringify(serverResp)}`);
    return;
  }
  this.machine = serverResp.machine;  // name of local computer, from server config file

  // load mainifest files so the can be displayed
  //await this.load(`1-manifest`);
  //await this.load(`2-dir`);
  //await this.load(`3-links`);


  /*
  // init laptop tags
  const laptop = app.db.getTable("laptop");
  app.tableUx.tags.desktopMatch    = [];
  app.tableUx.tags.desktopMissing = [];

  const desktop = app.db.getTable("desktop");
  // init desktop tag
  dir2.json.tags.notOnLaptop =[]

  // init Desktop index
  dir2.json.index = {}; // move to constructor is using index speeds things up
  dir2.json.index.notOnLaptop = {};
  for(let i=0; i<dir2.json.rows.length; i++) {
    dir2.json.index.notOnLaptop[ dir2.json.rows[i][5]  ] = i;
  }

  this.walk();
*/
  // display
  //app.tableUx.setModel( app.db, "1-manifest" );
  //app.tableUx.display()
}


}//  sync - client-side  //////// end of cass
