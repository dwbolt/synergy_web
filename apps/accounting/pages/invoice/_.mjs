 /*

show and add invoices

 */


 import {page_       } from '/_lib/UX/page_.mjs'
 import {table_class } from '/_lib/MVC/table/m.mjs'  ; 
 
 export class page_invoice extends page_ {
 

 async display(){  // force login to view page
     if ( !(await app.sfc_login.login_force( this.display.bind(this) )) ) {
             return; // login was not successfull, nothing todo
     }
 
     super.display();              //
 }
 

 async table_create() {
    
     // load hours
     this.invoice_m = new table_class()                      ; // create intance of table model
     await this.invoice_m.load(`/users/databases/CYC/hours`) ; // load table data
     
     // get viewers
     page.hours  = document.querySelectorAll("sfc-table" )[0]; // get table  viewer, should only be one
     page.record = document.querySelectorAll("sfc-record")[0]; // get record viewer, should only be one;
     
     page.hours.shadow.getElementById("table").addEventListener('click', page.hours.record_show.bind(page.hours) );
     
     // show user their hours
     page.hours.select =["created","date","start","end","duration","7","9"]; // select fields and order
     page.hours.set_model(page.table, "hours")             ; // give viewer data to display 
     page.hours.record_sfc = page.record                   ; // tell table viewer what record viewers to use
     page.hours.display()                                  ; // show users hours
     
     // init submit new hours
     //debugger
     page.record.table_viewer_set(page.hours)               ; // tell record viewer what table viewer to update when a change is made
    // page.record.select = ["2","3","5","6","7"]  
     page.record.select = ["created","date","start","end","duration","7","9"]
     page.record.new()
 }
 
 } // end class 
 
 // init page
 debugger
 //const page                       = new page_invoice(app.page_json.url_dir); // create instance of page
 //app.pages[app.page_json.url_dir] = page                                 ; // give app access to page methods
 //await page.init(app.page_json)                                          ; // app.page_json was defined app_24-08.mjs

 new page_invoice().init().table_create();  // view page,  app.page. is defined
 


 
 