
import  {page_      }    from '/_lib/UX/page_.mjs'
import {dbClass     } from '/_lib/MVC/db/m.mjs'     ;
export class page_crm extends page_ {

main(){
    this.crm     = {}                                ; // place to store all state info in page
    this.crm.db  = new dbClass(                     );  // create instance of database
    this.crm.db.load("/users/databases/synergy"     );  // load users synergy database
    this.crm.people_m  = 
    this.crm.people_cv = document.getElementById("pepople");

}

}

try {
    const p= new page_crm(); // create instance
    await p.init()             ; // display inital page,load web components
    await p.main()             ; // 
} catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}
  