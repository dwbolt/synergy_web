// figure out which version of synergy lib to use
const host = window.location.hostname.split(".");
const port = ( window.location.port === "" ? "" : `:${ window.location.port}` )
let lib;
switch (host[0]) {
case "synergy_local": lib  = `https://lib_local.sfcknox.org${port}`; break;
case "synergy_dev"  : lib  = `https://lib_dev.sfcknox.org${port}`  ; break;
case "synergy_beta" : lib  = `https://lib_beta.sfcknox.org${port}` ; break;
case "synergy"      : lib  = `https://lib.org${port}`              ; break;  
default             : lib  = `https://lib.org${port}`;
	debugger; alert(`case not hanlded host[0] = ${host[0]} loading production version of lib`);
}
window.app = {} ; app.lib = lib;  // seems like a hack, app.lib must be deffined before loading any thing in lib, so define it


const {app_spa}     = await import(`${app.lib}/app_spa.mjs`); // load parent class and define app_synergy
export class app_synergy extends app_spa {  // begian class def

constructor(){
	super(); // parent constructor

	// pull in contact menu
	document.querySelector("nav").innerHTML += `<sfc-html id="contact" href="${this.lib}/contact.html"></sfc-html>`

	this.open = []; // place to store pointers to apps that synergy is communicating with
	this.act  = {}; // create a place to store app data between pages.
}


async nav_menu_update(status){
	const menu = document.getElementById("loggedin_menu")
	if (status) {
		// user is logged in, so show nav menu options for that user
		const msg = await this.proxy.RESTget("/users/_apps/synergy/nav.html");
		if (msg.ok) {
			menu.innerHTML = msg.value;
		}
		app.edit_mode_view()// update edit radio button
	} else {
		// user logged out, hit nav menu options
		menu.innerHTML = "";
	}
}


app_open(
	name     // name of app to open in new window and communitcate with
	,element // DOM element.  element.getAttribute("data-msg") is string version of json
) {
	switch (name) {
	case "web_edit":
		// open database, when user clicks on things to edit, the database will nav to record where data is held
		if (app.open[name] === undefined) {
			// open window and remember it, so can be communicated with
			debugger
			app.open[name] =  window.open('apps/database/index.html?u=pages/database/', '_blank'); 
		} 
		app.open[name].postMessage( element.getAttribute("data-msg") );
		break;

	default:
		debugger
		app.sfc_dialog.show_error( `case not handled, name="${name}"` );
		break;
	}
}


} // end class

new app_synergy(); // create instace - will define globle variable app
await app.init( ); // do any async initialization