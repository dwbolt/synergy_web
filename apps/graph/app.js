class appClass {


constructor() {
	this.proxy = new proxyClass();
	this.login = new loginClass();
	this.json;  // loaded file
}

async main(){
	//app.login.buildForm(`login`);
	await this.load('_graph.json');
}


search(e){
	let
		 html = ""               // will contain data to dislay
		,nodes=this.json.nodes;  // nodes part of graph that is loaded

	const
	 	a_found     = [] // array of indexs that match selection criteria
		,searchStr	= e.value.toLowerCase();

	// walk all the nodes
	/* code to search names
	Object.keys(nodes).forEach((key, index) => {
		let a_names = Object.keys( nodes[key].data.name );    // array of name keys
		// walk all the name values in the node
		for(let i=0; i<a_names.length; i++) {
			if ( nodes[key].data.name[a_names[i]].toLowerCase().includes(searchStr) ) {
				// found a match, add index to array to display
				a_found.push(key);
				break;
			}
		}
		});
*/

Object.keys(nodes).forEach((key, index) => {
		if ( key.toLowerCase().includes(searchStr) ) {
			// found a match, add index to array to display
			a_found.push(key);
		}
	});

	// display a_found
	a_found.forEach((item, i) => {
		html += JSON.stringify(this.json.nodes[item])+"<br/>"
	});

	// display found
	document.getElementById("data").innerHTML = html;
}


async load(url) {
	this.json = await this.proxy.getJSON(url);
	let html="";
	// list out node keys
	Object.keys(this.json.nodes).forEach((key, index) => {
    html += JSON.stringify(key)+"<br>";
		});
	document.getElementById("data").innerHTML = html;
}

} // end class
