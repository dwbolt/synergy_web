const  {app_spa} = await import(`/_lib/app_spa.mjs`);  

export class app_database extends app_spa {



async message_process(event) {
	const database = event.data.database;
	if (database) {
		// select the database
		await app.page.database_select(database);
	}

	const table = event.data.table;
	if (table) {
		app.page.table_select(table);
	}

	const search = event.data.search;
	if (search) {
		debugger;
		const pks = this.model.search(search); // model retruns array of pks that match search criteria
		this.sfc_table.display(pks); // this.displayTag("search");
	}
}


/*
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
*/



} // end class

