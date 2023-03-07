class diff {  /u/  diff - client-side
  /*
  this client side code create lists of differences between laptop and desktop files

  Assume:
  laptop mainifest file - contains all files in directory that we want to sync
  desktop machine (home or office) - contains all files in directory

  Create:
    laptop.json.tags.desktopMatch
    laptop.json.tags.desktopMissing
    desktop.json.index.lapTopMissing that starts with all rows
    desktop.json.tags.lapTopMissing at end from desktop.json.index.lapTopMissing

  Process:
      walk laptap, add to tags.desktopMatch or json.tags.desktopMissing
      if file exists on desktop delete from index
      ad end of process create
  */


constructor (//  diff - client-side
) {
  this.i                    = 0;  // index into laptop data
  this.start;                     // init when diff main starts
}


async main(   //  diff - client-side
) {  // started from button in app.html
  this.start = new Date();  // see how long it runs

  // generate files on local machine
  const msg = `{
    "server"      : "web"
    ,"msg"        : "sync"
  }`
  const serverResp = await app.proxy.postJSON(msg);
  if (serverResp.msg) {
    // list of all files created
  } else {
    // user was not added
    alert(`User add Failed,${JSON.stringify(serverResp)}`);
    return;
  }
  this.machine = serverResp.machine;  // name of local computer, from server config file

  // load mainifest files so the can be displayed
  await this.load(`1-manifest`);
  await this.load(`2-dir`);
  await this.load(`3-links`);

  // send files to Ocean server

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
  app.tableUx.setModel( app.db, "1-manifest" );
  app.tableUx.display()
}


async load( //  diff - client-side
  fileName
  ,tableName=fileName
  ){
  const table  = app.db.tableAdd(tableName);       // create table and add to db
  const csv    = new csvClass(table);              // create instace of CSV object

  // load csv file from synced desktop
  const file   = await app.proxy.getText(`/users/sync/${this.machine}/${fileName}.csv`);

  csv.parseCSV(file, "json");         // parse loaded CSV file and put into table
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


walk(  //  diff - client-side
// keep calling walkLaptop until all laptop files have been searched on desktop
) {
  const laptop  = app.db.getTable("laptop");
  const r       =  laptop.json.rows;

  const desktop = app.db.getTable("desktop");
  const rr      = desktop.json.rows;
  const displayStatus = 10000;

  // walk laptop
  for (let i=0; this.i < r.length && i < displayStatus; this.i++) {
    i++; // loop counting
    // use indexes
    if (typeof(desktop.json.index.notOnLaptop[r[this.i][5]]) === 'number' ) {
      // add to  desktopMatch
      laptop.json.tags.desktopMatch.push(this.i);
      // delete from notOnLaptop
      delete desktop.json.index.notOnLaptop[r[this.i][5]];
    } else {
      // did not find match
      laptop.json.tags.desktopMissing.push(this.i);
    }
  };

  // display status
  document.getElementById("json").innerHTML = `
  elasped time         = ${(new Date() - this.start)/1000}

  laptop file          = ${this.i} of ${r.length}
  Desktop match        = ${laptop.json.tags.desktopMatch.length  }
  Desktop Missing      = ${laptop.json.tags.desktopMissing.length}

  Not on Laptop        = ${Object.keys(desktop.json.index.notOnLaptop).length}
     `

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

}//  diff - client-side  //////// end of cass
