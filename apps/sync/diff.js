class diff {  //  diff - client-side
  /*
  this client side code shows the  differences between two directors on differect computers

  Assume:
   dir1 and diry2 maybe on same or seperate computers
   The servers create mainifest files that contain a list of all files.  The lists are comppared and create sets:

   dir1Only  - delete it from dir1 or copy to dir2 
   Intersection- nothing or delete both
   dir2Only  - delte it from dir2 or copy to dir1

  Process:
      walk dir1 
      if file is in dir2 add to intersection and remove from dir2 index
      if not in Dir2 add to Dir1Only and remove from dir2 index
      what is left in dir2 index becomes dir2Only
*/

constructor ( //  diff - client-side
) {
  this.i                    = 0;  // index into laptop data
  this.start;                     // init when diff main starts
}


async upload(   //  diff - client-side
) {  // upload from local machine to server, at end server should have same version of files as local
  this.start = new Date();  // see how long it runs

  // generate mainifest files on local server 
  let msg = `{
    "server"      : "sync"
    ,"msg"        : "manifest"
    ,"type"       : "client2server"
    ,"direcotry"  : "upload"
    ,"location"     : "local"
  }`
  let serverResp = await app.proxy.postJSON(msg,"https://synergyalpha.sfcknox.org/sync");   // assume local server is always https://synergyalpha.sfcknox.org
  if (serverResp.msg) {
    // list of all files created
    alert("files generated on local server")
  } else {
    // user was not added
    alert(`User add Failed,${JSON.stringify(serverResp)}`);
    return;
  }

  // load local server mainifest files so the can be displayed
  await this.loadLocalServer(`client2server/upload/1-manifest`,'1-manifest-local');
  await this.loadLocalServer(`client2server/upload/2-dir`     ,'2-dir-local');
  await this.loadLocalServer(`client2server/upload/3-links`   ,'3-links-local');

  // generate mainifest files on logedin server 
 msg = `{
    "server"      : "sync"
    ,"msg"        : "manifest"
    ,"type"       : "client2server"
    ,"direcotry"  : "upload"
    ,"location"   : "remote"
  }`
  serverResp = await app.proxy.postJSON(msg,"/users/sync/client2server");                       // geting logged in user space
  if (serverResp.msg) {
    // list of all files created
    alert("files generated on logged in server")
  } else {
    alert("Did not generated on logged in server");
    return;
  }
  await this.loadRemoteServer(`1-manifest`,'1-manifest-remote');
  await this.loadRemoteServer(`2-dir`     ,'2-dir-remote');
  await this.loadRemoteServer(`3-links`   ,'3-links-remote');

  // init local tags
  const local = app.db.getTable("1-manifest-local"); //
  app.tableUx.tags.localMatch   = [];
  app.tableUx.tags.localMissing = [];

  // init remote tag
  const remote = app.db.getTable("1-manifest-remote");

  // init Desktop index
  remote.json.index = {}; // move to constructor is using index speeds things up
  remote.json.index.notOnLocal =[]
  for(let i=0; i<remote.json.rows.length; i++) {
    remote.json.index.notOnLocal[ remote.json.rows[i][5]  ] = i;
  }

  this.walk();

  // display
  app.tableUx.setModel( app.db, "1-manifest" );
  app.tableUx.display()
}


walk(  //  diff - client-side
// keep calling walk until all files on dir1 have been checked to see if they live in dir2
) {
  const local  = app.db.getTable("1-manifest-local");
  const r       =  local.json.rows;

  const remote = app.db.getTable("1-manifest-remote");
  const rr     = remote.json.rows;
  const displayStatus = 10000;  // display status after this many rows are looked at

  // walk local file list
  for (let i=0; this.i < r.length && i < displayStatus; this.i++) {
    i++; // loop counting
    // use indexes
    if (typeof(remote.json.index.notOnLocal[r[this.i][5]]) === 'number' ) {
      // add to remoteMatch
      laptop.json.tags.remoteMatch.push(this.i);
      // delete from notOnLaptop
      delete remote.json.index.notOnLaptop[r[this.i][5]];
    } else {
      // did not find match
      //local.json.tags.remoteMissing.push(this.i);
      app.tableUx.tags.localMissing.push(this.i);
    }
  };

  // display status
  document.getElementById("json").innerHTML = `
  elasped time         = ${(new Date() - this.start)/1000}

  locate file          = ${this.i} of ${r.length}
  remote match        = ${app.tableUx.tags.localMatch.length  }
  remote Missing      = ${app.tableUx.tags.localMissing.length}

  Not on local        = ${remote.json.index.notOnLocal.length}
     `
//  Not on local        = ${Object.keys(remote.json.index.notOnLaptop.length)}
  if (this.i <r.length) {
    // more work todo, start again in 10 millisec
    setTimeout( app.diff.walk.bind(this), 10 );
  } else {
    // done, create tag from indexe
     Object.keys(desktop.json.index.notOnLaptop).forEach((key, index) => {
        desktop.json.tags.notOnLaptop.push( desktop.json.index.notOnLaptop[key] );
    });

  }
}


async loadLocalServer( //  diff - client-side
   fileName
  ,tableName=fileName
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  const file   = await app.proxy.getText(`https://synergyalpha.sfcknox.org/sync/${fileName}.csv`);

  csv.parseCSV(file, "json");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


async loadRemoteServer( //  diff - client-side
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


async main(   //  diff - client-side
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
  desktop.json.tags.notOnLaptop =[]

  // init Desktop index
  desktop.json.index = {}; // move to constructor is using index speeds things up
  desktop.json.index.notOnLaptop = {};
  for(let i=0; i<desktop.json.rows.length; i++) {
    desktop.json.index.notOnLaptop[ desktop.json.rows[i][5]  ] = i;
  }

  this.walk();
*/
  // display
  //app.tableUx.setModel( app.db, "1-manifest" );
  //app.tableUx.display()
}


}//  diff - client-side  //////// end of cass
