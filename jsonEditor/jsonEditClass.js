

class jsonEditClass {

// jsonEditClass
constructor() {
  this.json    = {}; // data we are view/edit
  this.changes = []; // list of changes since last save
  this.proxy   = new proxyClass(); // async load server files, json and html fragments

}


// jsonEditClass - display root keys
async main() {
  // set jsonUrl to default or get from URL
  const urlParams = new URLSearchParams( window.location.search );
  let jsonURL = "/synergyData/jsonEditor/_.json";
  if ( urlParams.get('jsonURL') != null)  {
    jsonURL = `${urlParams.get('jsonURL')}`;
  }

  // load json file to view/edit
  document.getElementById("jsonURL").innerHTML = jsonURL;
  this.json = await this.proxy.getJSON(jsonURL);
  this.displayDetail();
}
dataChanged(element){
  alert(element.innerHTML);
  alert(element.value);
}

// jsonEditClass
displayDetail(
  element  // DOM element clicked on
) {

  // save clicked attribute
  let obj = this.json;   // will be displayed in value
  let childNodes = document.getElementById("root").childNodes;  // should be <td> of <tr>
  for (var i = 0; i < childNodes.length; i++) {
     let e = childNodes[i].childNodes[0]; // should be <slected>
     obj = obj[e.options[e.selectedIndex].value];
     if (e === element) {
       // done - delete any remaining children
       this.menuDeleteTo(i);
     }
  }

  let html = `<select  size=6 onchange="app.displayDetail(this)" style="width: 15ch">`;

  // build menu list with attribute name and type of value
  for (let key in obj) {
	  let value = obj[key];
	  if (obj.hasOwnProperty(key)) {
      let type = typeof(value);
      if (Array.isArray(value)) {
        type = `Array[${value.length}]`;
      } else if ("string" === type) {
        type=`"${value}"`
      } else if ("number" === type) {
        type=value;
      }

	    html += `<option value= "${key}"     >${key}:${type} </option>`;
	  }
	}

  // display selected attribute data in textarea
  if (typeof(obj) == "object") {
      document.getElementById("value").innerHTML = JSON.stringify(obj);
  } else {
      document.getElementById("value").innerHTML = obj;
  }

  // add menu to select atributes
  const newMenue = document.createElement("td")
  newMenue.innerHTML = html + "</select>";
  document.getElementById('root').appendChild(newMenue);
}


// jsonEditClass
menuDeleteTo(index) {
  const e = document.getElementById('root');

  while ( index < e.childElementCount -1 ) {
    e.removeChild(e.lastElementChild);
  }
}


} // appClass end
