const  {app_spa} = await import(`/_lib/app_spa.mjs`);  

export class app_synergy extends app_spa {

constructor(domain){
	super(domain);
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
	} else {
		// user logged out, hit nav menu options
		menu.innerHTML = "";
	}
}


app_open(
	name // name of app to open in new window and communitcate with
) {
	switch (name) {
	case "web_edit":
		// open database, when user clicks on things to edit, the database will nav to record where data is held
		if (app.open[name] === undefined) {
			// remember open window so it can be communicated with
			//app.open[name] =  window.open('apps/database/index.html', '_blank', 'width=600,height=400'); 
			app.open[name] =  window.open('apps/database/index.html?u=pages/database/', '_blank'); 
		}
		break;

	default:
		debugger
		app.sfc_dialog.show_error( `case not handled, name="${name}"` );
		break;
	}
}

} // end class

