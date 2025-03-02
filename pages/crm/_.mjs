const {page_      } = await import(`${app.lib}/UX/page_.mjs`);
const {dbClass    } = await import(`${app.lib}/MVC/db/m.mjs`);


export class page_crm extends page_ {

async main(){
    this.crm     = {}                                            ; // place to store all state info in page, do not want to risk stepping on parrent class info

    // load database
          this.crm.db  = new dbClass(                           ); // create instance of database
    await this.crm.db.load("/users/databases/synergy"           ); // load users synergy database and all it's tables
          this.crm.people_m  = this.crm.db.getTable("people"    ); // get access to people table 
    
    // get DOM cv (controler viewer)
    this.crm.people_cv   = document.getElementById("people_cv"        ); // cv for table of people
    this.crm.people_cv.set_model(this.crm.people_m                    ); // let controler view know the model it is using

    this.crm.people_r_cv = document.getElementById("people_record_cv" ); // cv for a person 
    this.crm.people_r_cv.table_viewer_set(this.crm.people_cv          ); // link record viewer to table viewer  

    // display people table
    this.crm.people_cv.init(                       ); // addEvent handler
    this.crm.people_cv.display(                    ); // show people data on screen

    //this.crm.people_cv.addEventListener('click', this.detail.bind(this) );
    //this.crm.people_cv.addEventListener('click', this.crm.people_cv.record_show.bind(this.crm.people_cv) );

    // display people record
    this.crm.people_r_cv.show(                                        ); // show emplty record for new
}


}  // end class



try {
    const p= new page_crm(); // create instance
    await p.init()             ; // display inital page,load web components
    await p.main()             ; // 
} catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}
  