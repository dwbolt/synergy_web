import  {page_      }    from '/_lib/UX/page_.mjs'

export class page_edit extends page_ {


edit_mode_toggle(){ 
    if (sessionStorage.edit_mode === "true") {
        sessionStorage.setItem("edit_mode", "false");
    } else {
        sessionStorage.setItem("edit_mode", "true");
    }
    this.radio_set();
}


radio_set(){  // set radio button from sessionStorage
    let edit_mode; // will be a string
    if ( sessionStorage.getItem("edit_mode") === "true") {
        edit_mode = true;  // convert to bool
    } else {
        edit_mode = false;
    }
    const radio = document.getElementById("edit_mode");
    radio.checked = edit_mode // trure false
}


}  // end class

try {
    const p = new page_edit(); // create instance
    await p.init()             ; // display inital page,load web components
    p.radio_set();
} catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}

export default page_edit