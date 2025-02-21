/** not in use */
import  {page_         }    from '/_lib/UX/page_.mjs'

export class page_files extends page_ {


}


const page                       = new page_qrcode(app.page_json.url_dir);  // give app access to page methods
app.pages[app.page_json.url_dir] = page;
await page.init(app.page_json);      // app.page_json was defined app_24-08.mjs

/*
try {
    const p= new page_invoice(); // create instance
    await p.init()             ; // display inital page,load web components
    await p.main()             ; // 
} catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}
*/