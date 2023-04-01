class appClass {  // appClass  client-side sync

    constructor() {  // appClass  client-side sync
      this.proxy   = new proxyClass();   //
      this.db      = new dbClass();      // model where the data will be
      this.tableUx = new tableUxClass("table","app.tableUx"); // display, search table, either db or 

      this.tags    = {}  // will contain tags, set by sync class
      this.sync    = new sync();

      this.login   = new loginClass();
      this.login.buildForm(`login`);
  
      this.tableName = null              // will contain selected table name
    }
    

    async load(e) {  // appClass  client-side sync
      //get file from server
      const filename = e.options[e.selectedIndex].value;
      await app.db.load(filename);
      app.db.save('json'); // show what will be saved
      app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
    }
    
    
    displayTable(  // appClass  client-side sync
      e  // dom select element
    ){
      // user has selected a table to display
      this.tableName = e.options[e.selectedIndex].value;
      this.tableUx.setModel( app.db, this.tableName );
      
      // set tags
      this.tableUx.display();
      app.tableUx.tags  = app.tags[this.tableName];
      app.tableUx.statusLine();
    }
    

    loadLocalJS(element) {  // appClass  client-side sync
      // load local csv file and display class
      // user just selected a new js file from their local drive
      const fr = new FileReader();
      fr.onload =  () => {
        const dScript = document.createElement('script');
        dScript.innerHTML = fr.result         // add code
        document.getElementById('dScript').appendChild(dScript);
      };
      fr.readAsText( element.files[0] ); // will only read first file selected
    }
    
    
    // load local csv file and display class
    loadLocalCSV(element) { // appClass  client-side sync
      // user just selected a new CSV file from their local drive
      const fr = new FileReader();
      fr.onload =  () => {
        // call back function when file has finished loading
        const table  = this.db.tableAdd(element.files[0].name);       // create table and add to db
        const csv     = new csvClass(table);     // create instace of CSV object
        csv.parseCSV(fr.result, "json");         // parse loaded CSV file and put into table
        this.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
      };
      fr.readAsText( element.files[0] ); // will only read first file selected
    }
    
    
    async loadLocal(element) { // appClass  client-side sync
      // user just selected a new data base file from their local drive
      const fr = new FileReader();
      fr.onload =  () => {
      app.db.loadLocal(fr.result);
      app.db.displayMenu('menu', "app.displayTable(this)", "app.export()"); // display menu of tables, user can select one to display
      };
      fr.readAsText( element.files[0] ); // will only read first file selected
    }
    
    
    export() {  // appClass  client-side sync
      app.db.export(this.tableName);
    }
    
    
} // appClass  client-side sync // End
    