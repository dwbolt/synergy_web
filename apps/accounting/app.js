class appClass {

// appClass - accounting - client side
constructor() {
  this.proxy    = new proxyClass(); // async load server files, json and html fragments
  this.db       = new dbClass();    // contains journal, chart of accounts, and ending statement balance for accounts that need reconsiliation
  this.format   = new formatClass();
  this.login    = new loginClass();
  
  this.tableUx  = {}
  this.tableUx.balance   = new tableUxClass("details" ,"app.tableUx.balance"  );
  this.tableUx.accounts  = new tableUxClass("details" ,"app.tableUx.accounts" );
  this.tableUx.journal   = new tableUxClass("details" ,"app.tableUx.journal"  );

  // create the buffer displays
  this.tableUx.balanceB  = new tableUxClass("detailsB","app.tableUx.balanceB" );
  this.tableUx.accountsB = new tableUxClass("detailsB","app.tableUx.accountsB");
  this.tableUx.journalB  = new tableUxClass("detailsB","app.tableUx.journalB" );

  this.tableUx.balanceB.buffer  = true;  // will be displaying and editing Buffer
  this.tableUx.accountsB.buffer = true;
  this.tableUx.journalB.buffer  = true;

  this.page;               // set to value of loaded page, it page = app.pages.loadYear is loadYear page is active.
  this.pages = {};
  this.pages.loadYear   = new loadYearClass();
  this.pages.reconcile  = new reconcileClass();
  this.pages.statements = new statementsClass();
  this.pages.data       = new dataClass();
  this.pages.home       = new homeClass();
}


// appClass - accounting - client side
main() {
  this.menu();  // display main menu
  document.getElementById('page').selectedIndex = 0;  // select home page on menue
  this.loadPage();  // load home page
}


// appClass - accounting - client side
menu(){  // init menu for application, display dropdown list of pages,
  // remember menu selection
  const e = document.getElementById('page');
  const i = e.selectedIndex;

  // add or remove data dependant menu items
  let html = `<option value= "home"     >Home </option>`

  if (this.login.getStatus()) {
    // logged in, so let user load data
    html += '<option value= "loadYear"  >Load Year</option>'
  }

  if (0<app.pages.loadYear.year) {
    html += `
    <option value= "reconcile" >Reconcile</option>
    <option value= "statements">Statements</option>
    <option value= "data"      >View/Edit Data</option>
    `
  }
  document.getElementById("page").innerHTML = html;

  // resore menu selection
  e.selectedIndex = i;
}


// appClass - accounting - client side
menuAdd(html){
  const newMenue = document.createElement("td")
  newMenue.innerHTML = html;
  document.getElementById('page').parentElement.parentElement.appendChild(newMenue);
}


// appClass - accounting - client side
menuDeleteTo(index) {
  const e = document.getElementById('page').parentElement.parentElement;

  while ( index < e.childElementCount ) {
    e.removeChild(e.lastElementChild);
  }
}

// appClass - accounting - client side
// fires when top level menu is slected
async loadPage() {
  const e   = document.getElementById('page');
  const url = e.options[e.selectedIndex].value;

  // delete sub menues
  this.menuDeleteTo(1);

  // fist load html
  document.getElementById("html").innerHTML = await app.proxy.getText(`1-pages/${url}.html`);

  // execute main code for loaded page
  if ( typeof(app.pages[url]) != "undefined") {
    // make sure a class is defined for page
    app.page = app.pages[url];
    await app.page.main();
  }
}


} // appClass - accounting - client side end
