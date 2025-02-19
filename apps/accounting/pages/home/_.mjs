import {page_       } from '/_lib/UX/page_.mjs'     ;
import {dbClass     } from '/_lib/MVC/db/m.mjs'     ;

class page_books extends page_ {  // only refereced in this file, no need to export


async book_open( // client side app_db - for a spa
    book     // name of set of books 
    ,year    // YYYY-MM-DD string
  ){ 
debugger;
  app.db       = new dbClass();   // allow other pages to access the open set of books
  app.db.load(`/ussers/_apps/accounting/${book}`);

}

  
} // end class


try {
  const p= new page_books(); // create instance
  await p.init()           ; // display inital page, load web components
} catch (error)  {
  debugger;
  app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}

