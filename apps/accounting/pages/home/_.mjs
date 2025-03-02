const {page_  } = await import(`${app.lib}/UX/page_.mjs`);
const {dbClass} = await import(`${app.lib}MVC/db/m.mjs` );

export class page_home extends page_ {  // only refereced in this file, no need to export

async display(){  // make sure users is logged before displaying page
  if ( !(await app.sfc_login.login_force( this.display.bind(this) )) ) {
        return; // login was not successfull, nothing todo
  }
  super.display();              //
}


async init() {
  await super.init();
  // fill the books list from directorys names
  this.select_order = document.getElementById("books_choose");  // 
  this.choices = [
   ["dwb_sfc","dwb_sfc"]   // hard code for now, pull from user directory for final
   ];
  this.select_order.multi_set(false)          ; // only select one thing
  this.select_order.hide("button_box") ; // add choises to selectr from 
  this.select_order.choices_add(this.choices) ; // add choises to selectr from 

  this.select_order.choices_click_custom = this.books_choose.bind(this);
}


async books_choose(  // client side app_class
	event  // user clicked on a set of books
){ 
  const choice = event.target.parentElement.value  ; // index into this.choices that was clicked on
  const books  = this.choices[choice][0]           ; // name of books directory
  app.act.dir  = `/users/_apps/accounting/${books}`; // will still need to add year to get location of database
  app.act.dbm  = new dbClass()                     ; // allow other pages to access the open set of books
}


async year_choose(  
  // user clicked on year of books to work on
  year // string "YYYY-MM-DD"  may be missing -MM-DD if account year starts on January 1
){ 
  const url = `${app.act.dir}/${year}/database`  ; // now have url to database
  await app.act.dbm.load(url)                    ; // load a year - database

  // give user feed back that data was loaded
  alert("books loaded")
}


} // end class


export default page_home