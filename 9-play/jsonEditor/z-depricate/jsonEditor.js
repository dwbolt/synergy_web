// jsonEditorClass.js
class jsonEditorClass {

constructor() {
	this.json = {}
}

// jsonEditorClass  - load and display json file
async main() {
	const urlParams = new URLSearchParams( window.location.search );
	let jsonURL = "accounting.json";
	if ( urlParams.get('jsonURL') != null)  {
		jsonURL = `${urlParams.get('jsonURL')}`;
	}

	this.json = await this.getJSON(jsonURL);	// load json file that had data for page
  this.displayDetail();
}


// jsonEditorClass
async getJSON(url) {
	try {
		const f = await fetch(url);
		if (f.ok) { // if HTTP-status is 200-299
			// get the response body (the method explained below)
			return f.json();
		} else {
			alert("HTTP-Error: " + url);
		}
	} catch (e) {
		alert("getJSON" + e);
	}
}


// display
displayDetail() {
	// start the HTML, then add rows
	let html="<div>";

	for (let key in this.json) {
	  let value = this.json[key];
	  if (this.json.hasOwnProperty(key)) {
	    html += key + "<br>";
	  }
	}

	document.getElementById("data").innerHTML = html + "</div>";
}

} // end jsonEditorClass
