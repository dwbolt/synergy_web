const  {app_spa} = await import(`/_lib/app_spa.mjs`);  

export class app_database extends app_spa {



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

