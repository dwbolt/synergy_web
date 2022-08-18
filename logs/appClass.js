class appClass {

// appClass  client-side
constructor() {
  this.proxy     = new proxyClass();   //
  this.db        = new dbClass();      // model where the data will be
  this.tableName = null                // will contain selected table name
  this.tableUx   = new tableUxClass("table","app.tableUx"); // display, search table, either db or csv
}


// appClass  client-side
async load(e) {
  //get file from server
  const filename = e.options[e.selectedIndex].value;
  await app.db.load(filename);
  app.db.save('json'); // show what will be saved
  app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
}


// appClass  client-side
displayTable( // user selected a log file to desplay
  e  // dom select element
){
  // user has selected a table to display
  this.tableName = e.options[e.selectedIndex].value;
  this.tableUx.setModel( app.db, this.tableName );
  this.tableUx.display();
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
  fr.readAsText( element.files[0] ); // will only read first file selected
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

  fr.readAsText( element.files[0] ); // will only read first file selected
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


} // End appClass  client-side
