// page module, exectued wwhen page finish loading
import  {page_         }    from '/_lib/UX/page_.mjs'

export class my_page  extends page_ { // sfcknox2/pages/clandar

async display(){
      if ( !(await app.sfc_login.login_force( this.display.bind(this) )) ) {
            return; // login was not successfull, nothing todo
      }

      this.json.header = `<h1>${app.sfc_login.user_display()}</h1>`
      super.display();              //
}


}  // end class

const page                       = new my_page(app.page_json.url_dir);
app.pages[app.page_json.url_dir] =  page;            // remember page
await page.init(app.page_json);                      // app.page_json was defined app_24-08.mjs
