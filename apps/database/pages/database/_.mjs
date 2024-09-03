import {page_       } from '/_lib/UX/page_.mjs'        ;
import {csvClass    } from '/_lib/db/csv_module.js'    ;
import {dbClass     } from '/_lib/db/db_module.js'     ;

import {menuClass   } from '/_lib/UX/menu_module.js'   ;
import {proxy       } from '/_lib/proxy/_.mjs'         ;

// web components that are used in this module
import {sfc_db_tables_class       } from '/_lib/db/sfc-db-tables/_.mjs'              ; // <sfc-db-tables>
import {sfc_record_relations_class} from '/_lib/db/sfc-record-relations/_.mjs'       ; // <sfc-record-relations>
import {sfc_table_class           } from '/_lib/db/sfc-table/_.mjs'                  ; // <sfc-table>
import {sfc_record_class          } from '/_lib/db/sfc-record/_.mjs'                 ; // <sfc-record>
import {sfc_select_order          } from '/_lib/web_componets/sfc-select-order/_.mjs'; // <sfc-select-order>


class app_db extends page_ {  // only refereced in this file, no need to export

async init(name, url){  // client side app_db
  await super.init(name, url);
  this.sfc_records          = document.getElementById("sfc_records")         ; //  one <sfc-record> for each table

  this.sfc_db_tables        = document.getElementById("sfc-db-tables")       ; // <sfc-db-tables>
  this.sfc_record_relations = document.getElementById("sfc-record-relations"); // <sfc-record-relation>

  this.relation_record       = document.getElementById("relation_record");

  this.stack_record         = document.getElementById("stack_record")        ; // <sfc-record>
  this.stack_list           = document.getElementById("stack_list")          ; //  <sfc-select-order>
  this.stack_list.multi_set(false)                                           ; // hide selected, work with array directly
  this.stack_list.choices_click_custom = this.choices_click_custom.bind(this);  // set custom_click
}


choices_click_custom(event) {  // client side app_db
  // display slection in stack record
  const index = event.target.value;
  const obj   = this.stack_array[index];
  this.stack_record.table_set( this.db.getTable(obj[1]) );    // set table
  this.stack_record.show(obj[2]);                             // show record with pk
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

  this.table_active = {name:""};             // no active table yet
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
    alert(`file="/appps/database/pages/home/_.mjs" 
method="load_db_list"
missing url="${this.url_meta}"
creating from template`
    );

    this.meta   = 
    {
      "meta":{
          "comment":"works with db_module.js"
          ,"databases": {}
        }
    }
    // now save it
    let msg = await proxy.RESTpost(JSON.stringify(this.meta), this.url_meta );
  } else {
    //this.meta   = obj.json; 
    this.meta   = obj.json; 
  }
  return true;
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
  <option value="cancel">Cancel</option>
  </select>
  
  <div id="database_dialog_detail"></div>
  </p>`);
}
  
  
async database_select( // client side app_db
  // user clicked on a database - show tables inside database
  database_name  //  user clicked on
) {
  this.db_name = database_name;
  this.table_active = {name:""};             // no active table yet
  
  if (!await app.sfc_login.login_force( this.database_select.bind(this,database_name) )) {
    // user not logged in
    return;
  }

  // load the database
  try {
    const dir_db = this.meta.databases[database_name].location;
    await this.db.load(dir_db); // load database and tables into memory
  } catch (error) {
    await app.sfc_dialog.show_error(`${error}`);
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

  this.db_tables_display();
}
  
  
db_tables_display(// dbClass - client-side
  // create menu of tables to display, and <sfc-table> and <sfc-record> web component for each table
) {
  // build table menu list and create web componet viewers
  const action       = "app.page.table_select(this,'table1UX')";
  //let html_menu      = `<select id="database_tables" size="9" onclick="${action}" oninput="${action}">`;
  let html_menu      = `<select id="database_tables" size="9" onclick="${action}">`;
  let html_sfc_records  = "";
  Object.keys(this.db.tables).forEach((table, i) => {
    html_menu          += `<option  value="${table}">${table}</option>`  ;
    html_sfc_records      += `<sfc-record id="${table}" style="display: none;"></sfc-record>`; 
  });
  html_menu += `</select>`;
  document.getElementById("menu_page_tables").innerHTML = html_menu; // add table menu to dom
  this.sfc_records.innerHTML = html_sfc_records                    ; // add place to display a record for each table in 

  // add function to edit relation for all <sfc-record> in this.sfc_records.children
  const children = this.sfc_records.children;
  for(let i=0; i<children.length; i++) {
    children[i].show_custom = this.relation_edit.bind(this);
  };
  // add function to edit relation for stack_record 
  this.stack_record.show_custom = this.relation_edit.bind(this);

         this.sfc_db_tables.db_set(this.db);   // create shadow dom for web component
  this.sfc_record_relations.db_set(this.db);   // create shadow dom for web component

  // attach table model to viewers & record views to tables
  Object.keys(this.db.tables).forEach((table_name, i) => {
    let model  = this.db.getTable(table_name);

    // set up <sfc-table>  inside <sfc-db-tablses>
    const table_viewer      = this.sfc_db_tables.shadow.getElementById(table_name);  // get table viewer  <sfc-table> 
    table_viewer.relations  = this.sfc_record_relations;                             // display relations with record
    table_viewer.record_sfc = document.getElementById(table_name);                   // attach <sfc-record> to  <sfc-table> 

    // set up <sfc-record> used by above table
    const record_viewer    = table_viewer.record_sfc;                                // get record viewer  <sfc-record> 
    record_viewer.table_set(model);                                                  // attach table       to <sfc-record>
    record_viewer.table_viewer_set(table_viewer);                                    // attach <sfc-table> to <sfc-record>

    // setup sfc-record-relations
    const viewer = this.sfc_record_relations.shadow.getElementById(table_name); //  
    viewer.record_sfc = this.stack_record;                                // attach <sfc-record> to  <sfc-table> 
  });

  document.getElementById("relation_record").table_set(this.db.getTable("relations"));   // <record_sfc> displays relation record between selected record and stack record 
}
  
  
stack_push( // client side app_db - for a spa
record_sfc // user click stack on a record, so add it to the stack
){
  const table  = record_sfc.table;
  const pk     = record_sfc.get_pk();
  const record = table.get_object(pk);

  let display  = table.name + " : " ;
  switch (table.name) {
    case "people": display += `${record.name_last}, ${record.name_first}`                                           ; break;
    case "phones": display += `${record.label} ${record.country_code} (${record.area_code}) ${record.phone_number}` ; break;
    case "groups": display += `${record.name_short} ${record.name_full}`                                            ; break;
    default      : display += `${record.label} ${record.display}`                                                   ; break;
  }

  this.stack_array.unshift([display, table.name, pk])  // add to first position of arra
  this.stack_list.choices_add(this.stack_array);       // display choices

  this.stack_record.table_set(this.db.getTable(table.name));  // set the model
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
    alert(`file="spa/database/_.js"
method="toggle" 
section_name="${section_name}"`);
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
    alert(`file="spa/database/_.js"
method="toggle" 
section_name="${section_name}"`);
  }
}

id_hide( // client side app_db - for a spa
  section_name  // used to show/hide major section.  If hiden the section shows in the top level menu so the user can later show it.  
  ,element  
) {
  const section = document.getElementById(section,section_name);

  if (section) {
    // toggle visibiltuy of section
    section.style.display =  "none";
    this.checkbox_update(element,element);
  } else {
    // error
    alert(`file="spa/database/_.js"
method="toggle" 
section_name="${section_name}"`);
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
    case "new":
      // code block
      this.database_detail_new()
      break;

    case "delete":
      this.database_delete();
      break;

    case "cancel":
      this.id_hide("database_dialog");
      break;      

    default:
      document.getElementById('dialog_detail').innerHTML = `"${dom.value}" not yet implemented for database`
  }
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
    alert("must enter database name to create");
    return;
  }
  
  if ( !this.meta.databases[name] === undefined) {
    // test for existance add to list of databases
    alert(`database "${name}" already exists`);
    return;
  }

  // add database name to meta data
  const url_db   = `${this.url_dir}/${name}`;
  const url_meta = `${this.url_dir}/_meta.json`      
  this.meta.databases[name] = {"location": url_db};   
                  
  const msg = await proxy.RESTpost(JSON.stringify(this.meta),url_meta); // save meta data
  if (!msg.success) {
    alert(`file="/synergydata/spa/database_.js
method="database_new"
url_meta="${url_meta}"
RESTpost failed to save`);
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
    let detail;

    // see if 
    switch(dom.value) {
      
    case "rename":
      detail = `
      <p><b>Rename Table</b><br>
      New Name <input type='text' ><br>
      <button>Rename</button>
      </p>
      <textarea id='msg'>Not impemented yet</textarea>`;
      break;

    case "import":
      detail = `
      <p><b>import csv file</b><br>
      <input type='file' accept='.csv' multiple="multiple" onchange='app.page.local_CSV_import(this)' ><br>
      <textarea id='msg'></textarea>
      </p>
      <p>imported CSV file will appear in above table list</p>`;
      break;
    
    case "new":
      detail = `create a new table<br>
      <select id="table_meta" onChange="app.page.table_structure(this)">
      <option value="addresses" >addresses</option>
      <option value="calendar"  >calendar</option>
      <option value="default"   selected>default</option>
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
      detail = `<p>Delete selected table.
      <input type='button' value="Delete" onclick='app.page.table_delete();'></p>`;
      break;

    case "merge":
      document.getElementById('dialog_detail').innerHTML = `<p>columns will be saved, and a new change file started.
      Need to decide where pk_max is stored, currently it is in meta.json 
      <input type='button' value="Merge" onclick='app.page.merge();'></p><p id="changes"></p>`;
      return;

    case "meta":
      document.getElementById('dialog_detail').innerHTML = `<p>edit meta
      <input type='button' value="Save" onclick='app.page.meta_save()'></p><textarea id="meta" rows="20" cols="90"></textarea>`;
      let msg = await proxy.RESTget( this.db.getTable(this.table_active.name).dir + "/_meta.json");  // get as text file so we can edit it
      if (msg.ok) {
        document.getElementById('meta').innerHTML = msg.value;
      }
      return;

    default:
      // code block
      detail = `
file="synergyData/spa/database/_.js" 
method="table_process" 
dom.value="${dom.value}"
not implemented`
    }

    document.getElementById('dialog_detail').innerHTML = detail;
}
  
  
async merge(){  // client side app_db - for a s
  alert(`"file="spa/database/_.js
method="merge"
not fully implemented, resolve pk_max issue before turninng on"`)
  //return; 
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
    alert("must enter name of table");
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
  this.pk = undefined;
  const index = this.sfc_record_relations.index;
  if (index[table_1] && index[table_1][pk_1] && index[table_1][pk_1][table_2]) {
    this.pk =  index[table_1][pk_1][table_2][pk_2]; // may still be undefined
  }

  // will be relation pk or undefined
  this.relation_record.hidden = false;
  this.relation_record.set_pk(this.pk);
  this.relation_record.edit();

  if (this.pk === undefined) {
    // add table1 and table 2 values, so new relation can be saved
    this.relation_record.shadow_by_id("pk_1"   ).value = pk_1 ;  
    this.relation_record.shadow_by_id("table_1").value = table_1;

    this.relation_record.shadow_by_id("pk_2"   ).value =  pk_2;
    this.relation_record.shadow_by_id("table_2").value =  table_2
  }
}
  
} // end client side app_db

const name = "database";
const page                       = new app_db(name);  // give app access to page methods
app.pages[app.page_json.url_dir] = page;

await page.init(app.page_json);      // app.page_json was defined app_24-08.mjs
await page.main("/users/databases");
