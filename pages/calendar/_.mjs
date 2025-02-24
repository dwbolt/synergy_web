// page module, exectued wwhen page finish loading
import  {page_         }    from '/_lib/UX/page_.mjs'

export class page_calendar  extends page_ { // sfcknox2/pages/clandar

async display(){
      if ( !(await app.sfc_login.login_force( this.display.bind(this) )) ) {
            return; // login was not successfull, nothing todo
      }

      this.json.header = `<h1>${app.sfc_login.user_display()}</h1>`
      await super.display();              //
      this.calendar    = document.getElementById("calendar");
      this.calendar.calendar_add("/users/databases/synergy/calendar"); // logged on users calender
      await this.calendar.init();                                 // load calenders and create html place holders
      await this.calendar.main();   // display calender or event page
}


}  // end class

/*
const page                       = new page_calendar("calendar", app.page_json.url_dir);
app.pages[app.page_json.url_dir] =  page;            // remember page
await page.init(app.page_json);                      // app.page_json was defined app_24-08.mjs
*/


try {
    //debugger
    const p= new page_calendar(); // create instance
    await p.init()             ; // display inital page,load web components
    //await p.main()             ; // 
} catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}