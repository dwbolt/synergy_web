const {app_spa}     = await import(`${app.lib}/app_spa.mjs`); // load app_spa module 

export class app_mlc extends app_spa {


async main(){
    await this.web_components.check(document.body);  // load any unload web components in body
	app.page               = document.querySelector("sfc-calendar");                // get web-componet
	//const {calendar_class} = await app.load(`web_components/sfc-calendar/_.mjs`);   // get web-componet sfc-calendar
	
	// init calendar
	app.page.calendar_add("/user/user_mlc/calendar");     //  pulic readonly link to mlc user calender
	//app.page.css_add("/_.css" );
	await app.page.init();                                // load calenders and create html place holders
	await app.page.main();                                // create and display calendar
		 app.page.table_view.rows_displayed(5);           // display 5 weeks
}

		 

} // end class
