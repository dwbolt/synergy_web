/*

SFCKnox.org web site app

*/


class appClass {

// appClass - client side
constructor() {
	this.urlParams  = new URLSearchParams( window.location.search );
	this.menu       = new menuClass();
	this.footer     = new footerClass();

	this.proxy      = new proxyClass();
	this.login      = new loginClass();
	this.calendar   = new calendarClass("weeks");
	this.format     = new formatClass();  // format time and dates

	this.widgetList;    // will hold instance of widgetListClass
	this.css;           // var to hold json css file
}


// appClass - client side
async main() {
//debugger;
	let page = this.urlParams.get('p'); // does not have subdirectory or extensions.
	// display home page if another page is not passed in
	if (page != null) {
		// page was passed in url
	  page  =  `${page}/_.json`;
	} else {
		// show home page with hero class and current events
		page = "home/_.json";
	//	document.getElementById('hero').style.display = "block";
	}

	// load the global css json file to be used by the classes
	this.css = await app.proxy.getJSON("/css.json");

	await this.menu.loadMenu();       // not sure menu object is ever used again
	//await this.footer.loadFooter();	  // do not think footter obeject is ever used again

	// load data for page
	this.widgetList = new widgetListClass("main");
  let obj = await this.getPage(page); // add system or user path;
	this.widgetList.setJSON(obj);

	// deside which list to display
	const list = this.urlParams.get('l'); // does not have subdirectory or extensions.
	// see if sub page is passed in
	let button="";
	if (this.urlParams.get('b') != null) {
		button =  this.urlParams.get('b');
	}
	const domButton = document.getElementById(button);

	if (list) {
		// display the nodes in list
		this.widgetList.displayList(list);
	} else if (domButton) {
		// named button is there
			this.widgetList.displayButton(domButton);
			//document.getElementById(button).click();
	} else if (document.getElementById('buttons').firstChild){
			// display first button
			this.widgetList.displayButton( document.getElementById('buttons').firstChild);
		//	document.getElementById('buttons').firstChild.click();
	} else {
		// no button, assume rows has an array of nodes to display
		this.widgetList.displayList("rows" );
	}
}


// appClass - client side
async getPage(
	page  // get user page if they request it and they are loggedin
) {
	let url;
	// get page from user area if u is in the URL
	if (this.urlParams.get('u') != null) {
		url = `/users/myWeb/${page}`
	} else {
		// user SFC general page
		url = `/synergyData/${page}`;
	}

	return await app.proxy.getJSON(url);
}


// appClass - client side
// called from json buttons
display(dom){
//	this.widgetList.display(dom);
	// goto url that will have the current button selected
	const urlParams = new URLSearchParams( window.location.search );
	let page="";
	if (urlParams.get('p') != null) {
		page =  "p=" +urlParams.get('p')+ "&";
	}

	window.location.href = encodeURI(`${window.location.origin}/app.html?${page}b=${dom.id}`);
}


// appClass - client side
buttonURL() {
	this.widgetList.buttonURL();
}


} // end appClass
