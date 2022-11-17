class appClass {

// appClass  client-side
constructor() {
  this.proxy     = new proxyClass();   //
  this.db        = new dbClass();      // model where the data will be
  this.tableName = null                // will contain selected table name
  this.tableUx   = new tableUxClass("table"       ,"app.tableUx" ); // display, search table, either db or csv
  this.tableUxG  = new tableUxClass("groupByTable","app.tableUxG"); // display, groupby results
}


async load(  // appClass  client-side
  e  //
) {
  // get file from server
  const filename = e.value;
  await app.db.load(filename);
  app.db.save('json'); // show what will be saved
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


// appClass  client-side
displayTable( // user selected a log file to desplay
  e  // dom select element
){
  // user has selected a table to display
  this.tableName = e.value;
  this.tableUx.setModel( app.db, this.tableName );
  this.tableUx.display();

  this.displayGroupBy();
}




// appClass  client-side
// load local csv file and display class
loadLocalJS(element) {
  // user just selected a new js file from their local drive
  const fr = new FileReader();
  fr.onload =  () => {
    const dScript = document.createElement('script');
    dScript.innerHTML = fr.result         // add code
    document.getElementById('dScript').appendChild(dScript);
  };

element.files.forEach((item, i) => {
    fr.readAsText( item );
});


}


loadLocalCSV(element) {  // appClass  client-side
  // load local csv file and display class
  // user just selected a new CSV file from their local drive
  const fr = new FileReader();
  fr.onload =  () => {      // call back function when file has finished loading
    const table  = this.db.tableAdd(element.files[0].name);    // create table and add to db
    const csv    = new csvClass(table);                        // create instace of CSV object

    // hard code hearder and field names based on file name
    if (element.files[0].name === "error.csv") {
      csv.parseCSV(fr.result, "json",["Time","Session","Request","Message"]);
                 table.json.fieldA = ["time","session","request","message"] ;
    } else if (element.files[0].name === "request.csv") {
      csv.parseCSV(fr.result, "json",["Time","Session","Request","Message","IP","URL"]);
                 table.json.fieldA = ["time","session","request","message","ip","url"] ;
    } else if (element.files[0].name === "response.csv") {
      csv.parseCSV(fr.result, "json",["Time","Session","Request","Time","last Request","Duration","IP","Method","URL","bytesSent"]);
                 table.json.fieldA = ["time","session","request","time","lastRequest" ,"duration","ip","method","url","bytesSent"] ;
    }

    table.field();  // generate field from fieldA
    this.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
  };

  const keys = Object.keys(element.files);
  for(let i=0; i<keys.length; i++) {
    fr.readAsText( element.files[keys[i]] );
  };
}


async loadLocal(element) {  // appClass  client-side
  // user just selected a new database file from their local drive
  const fr = new FileReader();
  fr.onload =  () => {
  app.db.loadLocal(fr.result);
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
  };
  fr.readAsText( element.files[0] ); // will only read first file selected
}


export() {  app.db.export(this.tableName);} // appClass  client-side


displayGroupBy(){  // appClass  client-side
  // put buttons for each field
  let html = "<b>Group By Fields:</b>";
  this.tableUx.model.json.fieldA.forEach((field, i) => {
    html += `<input type="button" value="${field}" onclick="app.groupBy('${field}')"> `
  });

  document.getElementById("groupByMenu").innerHTML = html;
}


groupBy(// appClass  client-side
  field // field to group by
) { // selected a column, then pressed the groupBy button
  const g = new groupByClass();           // create groupby instance
  g.groupBy(this.tableUx.model, [field]); // create groups

  // convert info in groupByClass to table
  const t = new tableClass();           // create blank table to put data in
  t.setHeader([field,"Count"]);
  const keys = Object.keys(g.groups);  // keys an array of

  // walk the group object, append a table row for each object
  keys.forEach((key, index) => {
    t.appendRow([key,g.groups[key].rowIndex.length])
  });


  // display table
  this.tableUxG.model     = t;               // attach table data to tableUX
  this.tableUxG.tableName = this.tableName+"-GroupBy";  //
  this.tableUxG.display();                   // show table to user
}


} // End appClass  client-side
