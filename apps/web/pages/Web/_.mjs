import {page_       } from '/_lib/UX/page_.mjs'     ;
import {csvClass    } from '/_lib/MVC/table/csv.mjs';
import {dbClass     } from '/_lib/MVC/db/m.mjs'     ;

import {menuClass   } from '/_lib/UX/menu_module.js';
import {proxy       } from '/_lib/proxy/_.mjs'      ;

// web components that are used in this module
import {sfc_table                 } from '/_lib/MVC/table/c.mjs'                      ; // <sfc-table>
import {sfc_select_order          } from '/_lib/web_components/sfc-select-order/_.mjs'; // <sfc-select-order>


class app_web extends page_ {  // only refereced in this file, no need to export

async init(name, url){  // client side app_db
  await super.init(name, url);
  this.sfc_records          = document.getElementById("sfc_records"         ); //  one <sfc-record> for each table

  this.sfc_db_tables        = document.getElementById("sfc-db-tables"       ); // <sfc-db-tables>
  this.sfc_record_relations = document.getElementById("sfc-record-relations"); // <sfc-record-relation>

  this.relation_record      = document.getElementById("relation_record"     );

  this.stack_record         = document.getElementById("stack_record"        ); // <sfc-record>
  this.stack_list           = document.getElementById("stack_list"          ); //  <sfc-select-order>
  this.stack_list.multi_set(false                                           ); // hide selected, work with array directly
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
    return;
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
  

} // end client side app_db

const name = "web";
const page                       = new app_web(name);  // give app access to page methods
app.pages[app.page_json.url_dir] = page;

await page.init(app.page_json);      // app.page_json was defined app_24-08.mjs
await page.main("/users/web");
