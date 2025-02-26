// page module, exectued wwhen page finish loading
import  {page_         }    from '/UX/page_.mjs'

export class my_page  extends page_ { // sfcknox2/pages/clandar

async display(){
      if ( !(await app.sfc_login.login_force( this.display.bind(this) )) ) {
            return; // login was not successfull, nothing todo
      }

      this.json.header = `<h1>${app.sfc_login.user_display()}</h1>`
      super.display();              //
}


}  // end class

new my_page().init();                      // app.page_json was defined app_24-08.mjs
