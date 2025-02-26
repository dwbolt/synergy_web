// page module, exectued wwhen page finish loading
const {page_}          = await import(`${app.lib}/UX/page_.mjs` );  


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


export default page_calendar  // at some point all page classes can just be named default, then this will not be neccary