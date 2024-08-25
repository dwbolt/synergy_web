// page module, exectued wwhen page finish loading
import  {page_         }    from '/_lib/UX/page_.mjs'
import  {calendar_class}    from '/_lib/web_componets/sfc-calendar/_.mjs';  // support <sfc-calendar> web componet

export class page_calendar  extends page_ { // sfcknox2/pages/clandar

async display(){
      super.display();              //
      this.calendar = document.getElementById("calendar");
      this.calendar.calendar_add("/users/databases/synergy/calendar"); // logged on users calender
      await this.calendar.init();                                 // load calenders and create html place holders
      await this.calendar.main();   // display calender or event page
}


}

const page         = new page_calendar("calendar", app.page_json.url_dir);
await page.init(app.page_json);                      // app.page_json was defined app_24-08.mjs
app.pages[app.page_json.url_dir] =  page;