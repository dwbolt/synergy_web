import {page_       } from '/_lib/UX/page_.mjs'     ;
import {csvClass    } from '/_lib/MVC/table/csv.mjs';
import {dbClass     } from '/_lib/MVC/db/m.mjs'     ;

import {menuClass   } from '/_lib/UX/menu_module.js';
import {proxy       } from '/_lib/proxy/_.mjs'      ;

// web components that are used in this module
import {sfc_select_order          } from '/_lib/web_components/sfc-select-order/_.mjs'; // <sfc-select-order>


class page_db extends page_ {  // only refereced in this file, no need to export

async init(){  // client side app_db
  await super.init();
  this.sfc_records          = document.getElementById("sfc_records"         ); //  one <sfc-record> for each table

  this.sfc_db_tables        = document.getElementById("sfc-db-tables"       ); // <sfc-db-tables>
  this.sfc_record_relations = document.getElementById("sfc-record-relations"); // <sfc-record-relation>

  this.relation_record      = document.getElementById("relation_record"     );

  this.stack_record         = document.getElementById("stack_record"        ); // <sfc-record>
  this.stack_list           = document.getElementById("stack_list"          ); //  <sfc-select-order>
  this.stack_list.multi_set(false                                           ); // hide selected, work with array directly
  this.stack_list.choices_click_custom = this.choices_click_custom.bind(this);  // set custom_click
  return this
}


choices_click_custom(event) {  // client side app_db
  // display slection in stack record
  const index = event.target.value;
  const obj   = this.stack_array[index];
  this.stack_record.table_set( this.db.getTable(obj[1]) );    // set table
  this.stack_record.show(obj[2]);                             // show record with pk
}

async server_change(element){
  debugger
  await this.main(element.value);
}


async main( // client side app_db - for a spa
    dir    // user directory that list of databases are in
  ){ 
  this.url_dir      = dir;
  this.db_name      = undefined;
  this.url_meta     = `${dir}/_meta.json`;   // json file that contains meta data for databases
  this.meta         = undefined              // where 
  this.db           = new dbClass();         // will hold selected database
  this.menu         = new menuClass("menu_page"); // where is puturl_meta
  this.tableUX      = {};                    // object contains one tableUXClass attribute for each table, init when user chooses database to open
  this.tableUX_rel  = {};                    // object contains one tableUXClass attribute for each table, used to display relationstack_pushs to an object/record       
  this.record_relation;                      // ux for record_relation;
  
  this.stack_array         = [];

  document.getElementById("db_url").innerHTML = this.url_dir;   // show user were the list of databases is coming from

  if (!await app.sfc_login.login_force( this.main.bind(this,dir) )) {
    // user not logged in
    return;
  }

  // user opened database app
  if(!await this.load_db_list()) {
      // error no need to go furter
    return; 
  }
  
  
  this.menu_db_list();  // create menu
  this.id_show("show_hide");
}
  
  
async load_db_list(  // dbClass - client-side
  // load list of databases 
  ) {
  // load list of tables in database
  const obj = await proxy.getJSONwithError(this.url_meta);   // get list of tables;
  if(obj.status === 404) {
    app.sfc_dialog.set("title","<b>Database Collection Not Found</b>");
    app.sfc_dialog.set("body",`for user: ${app.sfc_login.user_display()} <br>`); 
    app.sfc_dialog.set("buttons",`<button id="create">Create user Database Collection</button>`);
    app.sfc_dialog.addEventListener("create",'click', this.database_collection_create.bind(this));
    app.sfc_dialog.show_modal();
    return false;
  } else {
    this.meta   = obj.json; 
    return true;
  }
}

async database_open(element){
  const url = element.value;
  //const url = `${app.act.dir}/${year}/database`  ; // now have url to database
  debugger;
  await this.database_load(url);  
}


async database_collection_create(){  // dbClass - client-side
  this.meta   = `
    {
    "meta":{
        "comment":"works with db_module.js"
        ,"databases": {}
      }
  }
  `

  // now save it
  let msg = await proxy.RESTpost(this.meta, this.url_meta );
  if (msg.success) {
    // close dialog
    app.sfc_dialog.close();
    this.main(this.url_dir); // try to reload
  } else {
    app.sfc_dialog.show_error(`database_collection_create failed<br> msg= ${msg}`)
  }
}

  
menu_db_list() {  // dbClass - client-side
  // show list of databases
  let html = `<select size="10" onclick="app.page.database_select(this.value)">`;
  // build list of databases to choose
  if (this.meta.databases === undefined) { 
    this.meta.databases = {}; // this should not be needed, if 
  }
  const db = Object.keys(this.meta.databases);    // is an array of database names
  for(let i=0; i<db.length; i++ ) {
    html += `<option value="${db[i]}">${db[i]}</option>`;
  }

  html += "</select>"

  // display menu
  this.menu.init();
  this.menu.add(`
  click on database to view it's tables<br>
  <b>Databases</b><br>
  ${html}
  <br>
  <input type="button" value="Database Menu" onclick="app.page.id_show('database_dialog')"> 
  <p id="database_dialog" style="display:none">
  <b>Database Operation</b><br>
  <select size="10" onclick="app.page.database_dialog_process(this)">
  <option value="new">New</option>
  <option value="delete">Delete</option>
  <option value="relations">Relations</option>
  <option value="cancel">Cancel</option>
  </select>
  
  <div id="database_dialog_detail"></div>
  </p>`);
}
  
  
async database_select( // client side app_db
  // user clicked on a database - show tables inside database
  database_name  //  user clicked on
) {
  if (database_name === "") {
    return // user clicked on blank space in datbase selection, do nothing
  }

  if (!await app.sfc_login.login_force( this.database_select.bind(this,database_name) )) {
    // user not logged in
    return;
  }

  this.db_name = database_name;
  this.table_active = {
    name   : undefined   // name of table
    ,model : undefined   // model
  };      

  const dir_db = this.meta.databases[database_name].location;
  await this.database_load(dir_db); 
}

async database_load(dir_db){
  // load the database
  try {
    await this.db.load(dir_db); // load database and tables into memory
  } catch (error) {
    await app.sfc_dialog.show_error(`${error}`);
    return;
  }
  
  // display table menu
  this.menu.deleteTo(1);   // remove menues to the right of database memnu
  this.menu.add(`
  Tables
  <div id='menu_page_tables' style="min-width:100px;"></div>
  `);

  // add menu
  this.menu.add(`<div style="display:flex">
  <div>
  <b>Table Operation</b><br>
  <select id="table_operations" size="6" onclick="app.page.table_process(this)">
  <option value="import">Import</option>
  <option value="new"   >New</option>
  </select>
  </div>
  <div id='dialog_detail' style="margin:10px 10px 10px 10px;"></div>
  </div>`);

  await this.db_tables_display();
}
  
  
async db_tables_display(// dbClass - client-side
  // create menu of tables to display, and <sfc-table> and <sfc-record> web component for each table
) {
  // build table menu list and create web componet viewers
  const action       = "app.page.table_select(this,'table1UX')";
  //let html_menu      = `<select id="database_tables" size="9" onclick="${action}" oninput="${action}">`;
  let html_menu      = `<select id="database_tables" size="9" onclick="${action}">`;
  let html_sfc_records  = "";
  Object.keys(this.db.tables).forEach((table, i) => {
    html_menu          += `<option  value="${table}">${table}</option>`  ;
    html_sfc_records      += `<sfc-record id="${table}" style="display: none;"></sfc-record>`; // create 
  });
  html_menu += `</select>`;
  document.getElementById("menu_page_tables").innerHTML = html_menu; // add table menu to dom
  this.sfc_records.innerHTML = html_sfc_records                    ; // add place to display a record for each table in 

  // add function to edit relation for all <sfc-record> in this.sfc_records.children
  const children = this.sfc_records.children;
  for(let i=0; i<children.length; i++) {
    children[i].show_custom =   [            this.relation_edit.bind(this)                     ];  // edit relation custom 
    children[i].show_custom.push(this.sfc_record_relations.show.bind(this.sfc_record_relations));  // show relations custom
  };
  // add function to edit relation for stack_record 
  this.stack_record.show_custom = this.relation_edit.bind(this);

  await        this.sfc_db_tables.db_set(this.db);   // create shadow dom for web component
  await this.sfc_record_relations.db_set(this.db);   // create shadow dom for web component

  // attach table model to viewers & record views to tables
  Object.keys(this.db.tables).forEach((table_name, i) => {
/*
    // set up <sfc-table>  inside <sfc-db-tablses>
    table_viewer.relations  = this.sfc_record_relations;                             // display relations with record
    table_viewer.set_model(model,table_name)
*/
    // set up <sfc-record> used by above table
    const model             = this.db.getTable(table_name                        );
    const table_viewer      = this.sfc_db_tables.shadow.getElementById(table_name); // get table viewer  <sfc-table> 
    table_viewer.record_sfc = document.getElementById(table_name                 ); // attach <sfc-record> to  <sfc-table>

    const record_viewer     = table_viewer.record_sfc                             ; // get record viewer  <sfc-record> 
    record_viewer.table_set(model                                                ); // attach table       to <sfc-record>
    record_viewer.table_viewer_set(table_viewer                                  ); // attach <sfc-table> to <sfc-record>

    // setup sfc-record-relations
    const viewer = this.sfc_record_relations.shadow.getElementById(table_name); //  

    // setup scf)record stack
    viewer.record_sfc = this.stack_record;                                // attach <sfc-record> to  <sfc-table> 
  });

  // <record_sfc> displays relation record between selected record and stack record 
  document.getElementById("relation_record").table_set(this.db.getTable("relations"));  
}
  
  
stack_push( // client side app_db - for a spa
record_sfc // user click stack on a record, so add it to the stack
){
  const table  = record_sfc.table;
  const pk     = record_sfc.get_pk();
  const record = table.get_object(pk);

  let display  = table.name + " : " ;
  switch (table.name) {  // do not like this code, need to be part of table define
    case "people": display += `${record.name_last}, ${record.name_first}`                                           ; break;
    case "phones": display += `${record.label} ${record.country_code} (${record.area_code}) ${record.phone_number}` ; break;
    case "groups": display += `${record.name_short} ${record.name_full}`                                            ; break;
    case "groups": display += `${record.name_short} ${record.name_full}`                                            ; break;
    default      :
      // for now get the first two of select, this is brittle code
      const sel = table.meta_get("select")
      display += `${record[sel[1]]} ${record[sel[2]]}`                                                   ; break;
  }

  this.stack_array.unshift([display, table.name, pk])  // add to first position of arra
  this.stack_list.choices_add(this.stack_array);       // display choices

  this.stack_record.table_set(this.db.getTable(table.name));  // set the model
  this.stack_record.table_viewer_set( document.getElementById(table.name).table_viewer ) // set the table viewer
  this.stack_record.show(pk);                                 // display record with pk
}
  
  
id_show(id){  // client side app_db - for a spa
  const element = document.getElementById(id);
  element.style.display = "block";  // will cause problem if element is inline rather than block
}

id_hide(id){  // client side app_db - for a spa
  const element = document.getElementById(id);
  element.style.display = "none";
}
  

id_toggle( // client side app_db - for a spa
   section_name  // used to show/hide major section.  If hiden the section shows in the top level menu so the user can later show it. 
  ,element       // dom element that was checked 
) {
  const section = document.getElementById(section_name);

  if (section) {
    // toggle visibiltuy of section
    section.style.display = section.style.display === "none" ? "block" : "none";
    this.checkbox_update(section,element);
  } else {
    // error
    app.sfc_dialog.show_error(`unhandled case<br> section_name="${section_name}"`);
  }
}


id_show( // client side app_db - for a spa
   section_name  // used to show/hide major section.  If hiden the section shows in the top level menu so the user can later show it. 
  ,element  
) {
  const section = document.getElementById(section_name);

  if (section) {
    // toggle visibiltuy of section
    section.style.display =  "block";
    this.checkbox_update(section,element);
  } else {
    // error
    app.sfc_dialog.show_error(`unhandeld case<br> section_name="${section_name}"`);
  }
}


checkbox_update(  // client side app_db - for a spa
   section
  ,element=null
){
  if(element===null) return  // nothing todo
  //element.checked = ( section.style.display === "none" ? false :  true )
}
  
  
database_dialog_process(  // client side app_db - for a spa
  dom
  ){
  switch(dom.value) {
    case "new"       : this.database_detail_new()     ; break;
    case "delete"    : this.database_delete()         ; break;
    case "relations" : this.database_relations()      ; break;
    case "cancel"    : this.id_hide("database_dialog"); break;      
    default:
      document.getElementById('database_dialog_detail').innerHTML = `"${dom.value}" not yet implemented for database`
  }
}


database_relations() {  // client side app_db - for a spa
  // user pushed relations button - show dialog box to start or close process
  app.sfc_dialog.set("title","Update Objects Relations Fields");
  app.sfc_dialog.set("body",`Check each object refereced in the relations table and makes sure object's relation field is up todate
    <div id="msg"></div>`);
  app.sfc_dialog.set("buttons",`<button id="start">Start</button>`);
  app.sfc_dialog.addEventListener("start",'click', this.database_relations_start.bind(this));
  app.sfc_dialog.show_modal();
}

/**
the _relations field of each object is of the structure, it is a readonly meta data field

  _relations: {
  "order": []
  ,"tables": {
    "people":{
      pk?: pk_relation
    ,pkpN, pke]...
  }
**/
async database_relations_start(){   // client side app_db - for a spa
  // user pushed start button

  // make sure a database is selected
  if (this.db_name === undefined) {
    app.sfc_dialog.set("msg","<br>Must Select database first<br>");
    return;
  }

  // make sure a relations table exists
	const relation_table = app.page.db.getTable("relations");
	if (relation_table === undefined) {
    app.sfc_dialog.set("msg","<br>database must have a relations table<br>");
		return // this database does not have a relation table.
	}

  // update in memory all the records that missing relation information  
	let pks       = relation_table.get_PK();    // array of PK keys for entire relation table;

  // walk relation table and update relations field
  const update = {};  // store pks that need to be saved to disk {"table_name":[pk1,pk2...], "table_name2":[pk1,pk2....]}
  for(let i=0; i< pks.length; i++) {
    const pkr = pks[i];                              // pk for a relatoin record
    const  record = relation_table.get_object(pkr);  // get the relation record to process

    this.relations_update(pkr,record.table_1, record.pk_1, record.table_2, record.pk_2, update); // update 1st object
    this.relations_update(pkr,record.table_2, record.pk_2, record.table_1, record.pk_1, update); // update 2nd object
  }

  // build & save change log for each table
  const table_names = Object.keys(update);
  // walk tables
  for(let i=0; i<table_names.length; i++) {
    const table_name = table_names[i]
    const table = app.page.db.getTable(table_name);  // table
    const pks   = Object.keys(update[table_name]);  // get list of pks in table where _relations needs to be saved
    let   nsj = "" ;  // build change log string 
    for(let ii=0; ii<pks.length; ii++){
      const pk = pks[ii];   // record to update
      nsj += table.change_log_add(pk, "_relations", table.get_value(pk,"_relations"));
    }
    await table.change_log_patch(nsj);  // save change log for table
  }
}


relations_update(  // client side app_db - for a spa
   pkr           // pk of relation
  ,table_name_c  // table  to change
  ,pk_c          // record to change
  ,table_name_r  // table   to reference
  ,pk_r          // recored to referenc
  ,update        // holds pks that need to be saved on disk
){
  // find record to change
  const table_c = app.page.db.getTable(table_name_c);  // get table to change

  // get _relations
  let _relations;
  if ( table_c.get_value(pk_c,"_relations") === undefined){
    // define as empty object if not defined
    table_c.set_value(pk_c,"_relations",{});
  }
  _relations = table_c.get_value(pk_c,"_relations");  // create short cut to _relations

  if (_relations.tables               === undefined) {_relations.tables               = {};}
  if (_relations.tables[table_name_r] === undefined) {_relations.tables[table_name_r] = {};}

  // see if reference table and pk in already recorded
  if (_relations.tables[table_name_r][pk_r] === pkr) {
    return;  // it is already there, nothing to do, so return
  }
 
  // referenc is not in the list, so addit, and mark it for update
  _relations.tables[table_name_r][pk_r] = pkr;  // update memory

  if (update[table_name_c] === undefined) {update[table_name_c]={}}
  update[table_name_c][pk_c] = true;  // value is not needed, there maybe multiple canges to _relation, but we only want to save once at the end
}


async database_delete(){ // client side app_db - for a spa
  await this.db.delete();  // delete database

  // delet from list of databases
  delete this.meta.databases[this.db_name];
  const msg = await proxy.RESTpost(JSON.stringify(this.meta),`${this.url_dir}/_meta.json`); // save meta data
  this.menu_db_list();    //
}
  
  
database_detail_new(){ // client side app_db - for a spa
  document.getElementById("database_dialog_detail").innerHTML = `
  create a new database<br>
  <input type="text" id="new_database_name" placeholder="Enter Database Name"><br>
  <input type="button" value="Create New Database" onclick="app.page.database_new();">
  `
}
  
  
async database_new(){ // client side app_db - for a spa
  const name = document.getElementById("new_database_name").value;
  if (name==="") {
    app.sfc_dialog.set("title",`<b>Missing Infomation</b>`);
    app.sfc_dialog.set("body",`Enter database name to create`);
    app.sfc_dialog.show_modal();  
    return;
  }
  
  if ( !this.meta.databases[name] === undefined) {
    // test for existance add to list of databases
    app.sfc_dialog.show_error(`database "${name}" already exists, no changes<br>`);
    return;
  }

  // add database name to meta data
  const url_db   = `${this.url_dir}/${name}`;
  const url_meta = `${this.url_dir}/_meta.json`      
  this.meta.databases[name] = {"location": url_db};   
                  
  const msg = await proxy.RESTpost(JSON.stringify(this.meta),url_meta); // save meta data
  if (!msg.success) {
    app.sfc_dialog.show_error(`Create Database failed.<br> url_meta="${url_meta}"`);
    return;
  }
  await this.db.new(url_db);  // create database 
  this.menu_db_list();    // show new database in menu
}
  
  
table_structure(dom){ // client side app_db - for a spa
  // set name of table to be structure, user can change it
  document.getElementById("new_table_name").value = dom.value;
}
  
  
async table_process(  // client side app_db - for a spa
    dom
    ){
    let detail="";
    const dialog_detail = document.getElementById('dialog_detail');
    // see if 
    switch(dom.value) {
      
    case "rename":
      app.sfc_dialog.set("title"  , `<b>Rename Table</b>`);
      app.sfc_dialog.set("body"   , `<p>New Name <input id="name_new" type='text' value="projects"> <textarea id='msg'>Rename table</textarea> </p>`);
      app.sfc_dialog.set("buttons", `<button onclick="app.page.table_rename()"> Rename </button>`);
      app.sfc_dialog.show_modal();
      break;

    case "import":
      dialog_detail.innerHTML = `
      <p><b>import csv file</b><br>
      <input type='file' accept='.csv' multiple="multiple" onchange='app.page.local_CSV_import(this)' ><br>
      <textarea id='msg'></textarea>
      </p>
      <p>imported CSV file will appear in above table list</p>
      PK to make header <input type="text" onblur ="app.page.header_make(this)" > moving out side will execute
      `;
 
      break;
    
    case "new":
      dialog_detail.innerHTML = `create a new table<br>
      <select id="table_meta" onChange="app.page.table_structure(this)">
      <option value="addresses" >addresses</option>
      <option value="calendar"  >calendar</option>
      <option value="default"   selected>default</option>
      <option value="web"       >web</option>
      <option value="groups"    >groups</option>
      <option value="people"    >people</option>
      <option value="phones"    >phones</option>
      <option value="relations" >relations</option>
      <option value="tasks"     >tasks</option>
      <option value="urls"      >urls</option>
      </select> Select table structure<br>
      <input type="text" id="new_table_name" placeholder="Enter Table Name"><br>
      <input type="button" value="Create New Table" onclick="app.page.table_new();">`
      break;

    case "delete":
      // table
      dialog_detail.innerHTML = `<p>Delete selected table.
      <input type='button' value="Delete" onclick='app.page.table_delete();'></p>`;
      break;

    case "merge":
      dialog_detail.innerHTML = `<p>columns will be saved, and a new change file started.
      Need to decide where pk_max is stored, currently it is in meta.json 
      <input type='button' value="Merge" onclick='app.page.merge();'></p><p id="changes"></p>`;
      return;

    case "meta":
      dialog_detail.innerHTML = `<p>edit meta
      <input type='button' value="Save" onclick='app.page.meta_save()'></p><textarea id="meta" rows="20" cols="90"></textarea>`;
      let msg = await proxy.RESTget( this.db.getTable(this.table_active.name).dir + "/_meta.json");  // get as text file so we can edit it
      if (msg.ok) {
        document.getElementById('meta').innerHTML = msg.value;
      }
      return;

    default:
      // code block
      dialog_detail.innerHTML = `
file="synergyData/spa/database/_.js" 
method="table_process" 
dom.value="${dom.value}"
not implemented`
    }
}


header_make(element){
  // have imported a csv file, and the first row is a header.
  // copy first row to header
  const pk = element.value;                 // get value of pk to make header
  this.table_active.model.header_make(pk);  // copy data to header, save to meta data
}



table_rename() {  //client side app_db
  // rename table
  debugger
  const name_current = document.getElementById("database_tables").value;  // get current table name
  const name_new     = document.getElementById("name_new"       ).value;  // get new     table name

  // rename 
}
  
  
async merge(){  // client side app_db - for a s
  app.sfc_dialog.show_error(`merge not fully implemented, resolve pk_max issue before turninng on`);
  return; 
  const msg = await this.db.table_merge(this.table_active.name); 
}
    
  
async meta_save() {  // client side app_db - for a s
  const text = document.getElementById("meta").value;
  const msg = await proxy.RESTpost(text, this.db.getTable(this.table_active.name).dir + "/_meta.json");
  if (msg.success) {
    document.getElementById('meta').innerHTML = "save compete"
  } else {
    document.getElementById('meta').innerHTML = "error"
  }
}
  
async table_new(){  // client side app_db - for a spa
  // update database metadata
  const name = document.getElementById("new_table_name").value;  // get name of table from user
  if (name==="") {
    app.sfc_dialog.show_error("must enter name of table to create");
    return;
  }
  const meta_name = document.getElementById("table_meta").value;  // get name of table from user

  // create table in database
  const table = this.db.tableAdd(name);
  await this.db.meta_save()    ;  // save database meta data changes
  await table.create(name,meta_name);  // save meta data
  await table.merge()          ;  // save empty table to server

  // update table list
  this.db_tables_display()
}
  
  
async table_delete(){
  const table_name = this.table_active.name;  // get table to delete
  this.table_active.name = "";

  let msg = await this.db.table_delete(table_name); // have database delete table
  
  delete this.db.tables[table_name];                // delete from database loaded tables
  this.db_tables_display();                         // update table list
  }
  
  
table_select(   // client side app_db
  // user clicked on a table - so display it
    DOM       
  ) { 
    const table_name = DOM.value                                  ; // remember table_name user clicked on
    this.table_active = {
       name  : table_name                   // name of table
      ,model : this.db.getTable(table_name) // model
    };      
  

    // add more table operations if not already done
    const table_ops  = document.getElementById("table_operations");
    if (table_ops.children.length < 3) {
      // first table is selected, so add more options
      table_ops.innerHTML += `
      <option value="rename" >Rename</option>
      <option value="merge"  >Merge</option>
      <option value="delete" >Delete</option>
      <option value="meta"   >Meta</option>
      `
    }

    // hide old active table
    if ( 0 < this.table_active.name.length ) {
      document.getElementById(this.table_active.name).style.display = "none";
    }

    // show new active table and record
    this.table_active.name = table_name                         ;  // remember active table - (safari does not suport style="display:none;" on optons tag, )
    this.sfc_db_tables.show(table_name)                         ;  // hide all tables but table_name
    this.record_selected   = document.getElementById(table_name);
    this.record_selected.style.display = "block"                ; // show record assciated with table being displayed
}
  
  
displayIndex(// client side app_db
  value) {    
  return `<u style="color:blue;">${value}</u>`;  // style it like a hyper link so it will get clicked on.
}
  
  
local_CSV_import( // client side app_db - for a spa
    // user selected a new CSV file from their local drive, load it into memory and add it to the table menu
    element  // DOM
    ) {
    
    this.fr = new FileReader();

    this.fr.onload =  async () => {
      // call back function when file has finished loading
      let table_name = element.files[this.i].name;
      table_name     = table_name.slice(0, table_name.length -4);  // get rid of .csv in table name
      const table    = this.db.tableAdd(table_name);               // create table and add to db
      const csv      = new csvClass(table);                        // create instace of CSV object
      csv.parse_CSV(this.fr.result, "msg");                        // parse loaded CSV file and put into table
      await this.db.table_merge(table_name);                       // save import
      this.db_tables_display();

      this.i ++ // process next file import
      if (this.i < element.files.length) {
        this.fr.readAsText( element.files[this.i] ); // import next file
      }
    };

    this.i = 0;
    this.fr.readAsText( element.files[this.i] ); // read first file
}
  
  
async saveDB( // client side app_db - for a spa
  // user clicked on save to server button
  ){
  await this.db.save();
  this.show_changes();
}
  
  
show_changes(){ // client side app_db - for a spa
  let html = "";
  const table        = this.db.getTable(this.table_active.name);  // get tableClass being displayed
  const changes      = table.changes_get();
  const primary_keys = Object.keys(changes);
  for(var i=0; i<primary_keys.length; i++) {
    let key = primary_keys[i]
    html += `key=${key}<br>`;
    // show on changed field per line
    let fields = Object.keys(changes[key]);
    for(var ii=0; ii<fields.length; ii++) {
      html += ` &nbsp;&nbsp;field = ${fields[ii]} &nbsp;&nbsp; obj=${JSON.stringify(changes[key][fields[ii]])}<br>`
    }
  }
  document.getElementById("changes").innerHTML = html
}
  
  
relation_edit( // client side relation_class
) {
  if (0 === this.stack_record.shadow_by_id("body").innerHTML.length) {
    this.relation_record.hidden = true;
    return; // there is nothing in the stack, so nothing to do;
  }

  if (0 === this.record_selected.shadow_by_id("body").innerHTML.length) {
    this.relation_record.hidden = true;
    return; // there is no record selected
  }

  const  table_1 = this.record_selected.table.name; // from selected record 
  const  pk_1    = this.record_selected.get_pk();   

  const table_2 = this.stack_record.table.name ;  // from stack_record
  const pk_2    = this.stack_record.get_pk();

  // return pk for relation, or undefine if does not exist
  const pk_r = this.record_selected.table.get_value(pk_1,"_relations")?.tables?.[table_2]?.[pk_2];

  // will be relation pk or undefined
  this.relation_record.hidden = false;
  this.relation_record.set_pk(pk_r);
  this.relation_record.edit();  // will fill form values if edit, blank if new

  if (pk_r === undefined) {
    // add table1 and table 2 values, so new relation can be saved
    this.relation_record.shadow_by_id("pk_1"   ).value = pk_1 ;  
    this.relation_record.shadow_by_id("table_1").value = table_1;

    this.relation_record.shadow_by_id("pk_2"   ).value =  pk_2;
    this.relation_record.shadow_by_id("table_2").value =  table_2
  }
}
  
} // end client side app_db


try {
  const p= new page_db() // create instance
  await p.init()                      // init
  await p.main("/users/databases")    // load the server meta data
} catch (error)  {
  debugger;
  app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}

