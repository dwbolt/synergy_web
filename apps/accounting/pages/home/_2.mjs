// accounting

export class page_accounting extends page_ { // client side dbUXClass - for a page

  #DOMid

constructor( // client side dbUXClass - for a page
  url
){
  super(url);
  
  /*
  this.db       = new dbClass();
  this.table    = new tableClass();
  //this.groupby  = new groupByClass();

  this.tableUx           = {}  // create object ot hold all the 
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
  //this.pages.loadYear   = new loadYearClass();
  this.pages.reconcile  = new reconcileClass();
  this.pages.statements = new statementsClass();
  this.pages.data       = new dataClass();
  this.pages.home       = new homeClass();
  */
}

}


const page                       = new page_accounting(app.page_json.url_dir);
app.pages[app.page_json.url_dir] =  page;
await page.init(app.page_json);            