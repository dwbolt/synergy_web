const host = window.location.hostname.split(".");
const port = ( window.location.port === "" ? "" : `:${ window.location.port}` )

let lib;
switch (host[0]) {
case "synergy_local": lib  = `https://lib_local.sfcknox.org${port}`; break;
case "synergy_dev"  : lib  = `https://lib_dev.sfcknox.org${port}`  ; break;
case "synergy_beta" : lib  = `https://lib_beta.sfcknox.org${port}` ; break;
case "synergy"      : lib  = `https://lib.org${port}`              ; break;  
default             : lib  = `https://lib.org${port}`;
	debugger; alert(`case not hanlded host[0] = ${host[0]}`);
}

// load parent class and define app_synergy
const {app_spa}     = await import(`${lib}/app_spa.mjs`); // load app_spa module 

export class app_database extends app_spa {

constructor(){
debugger
	super(); // exit parent constructor

	// pull in contact menu
	document.querySelector("nav").innerHTML += `<sfc-html id="contact" href="${this.lib}/contact.html"></sfc-html>`
}


async message_process(event) {
	const msg          = JSON.parse(event.data); // convert string to json

	if (msg.database_name) {
		// select the database
		await app.page.database_select(msg.database_name);
	}

	if (msg.table_name) {
		app.page.table_select(msg.table_name);
	}

	if (msg.search_critera) {
		// show all the changes to page
		const table     = this.page.table_active.model      ; // model of active table
		let pks         = table.search(msg.search_critera)  ; // retruns array of pks that match search criteria

		const sfc_table = this.page.sfc_db_tables.shadow.getElementById(msg.table_name);
		sfc_table.display(pks); // this.displayTag("search");
/*
		// edit or create new record with param
		criteria = [ ["attribute","equal",search.attribute], ["path","equal",search.path] ];
		pks      = table.search(criteria); // model retruns array of pks that match search criteria
		let pk = pks[0];  
		if (pk === undefined) {
			// undefined is ok, mean we are creating an new record

		} else {
			// edit an existing record

		}
*/
	}
}


} // end class
debugger
new app_database(); // create instace - will define globle variable app
await app.init( ); // do any async initialization
