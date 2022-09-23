class appClass {


constructor() {  // appClass - clientside
  this.json    = {}; // data we are view/edit
  this.changes = []; // list of changes since last save
  this.proxy   = new proxyClass(); // async load server files, json and html fragments
  this.format  = new formatClass();
  this.login   = new loginClass();
}


main() {  // appClass - clientside
  //- display root keys
  // set jsonUrl to default or get from URL
  const urlParams = new URLSearchParams( window.location.search );

  let parm = urlParams.get('path');
  if ( parm != null)  {
    document.getElementById('path').value = param;
  }

  parm = urlParams.get('name') ;
  if ( parm != null)  {
    document.getElementById('name').value = parm;
  }
}


async loadJSON(){ // appClass - clientside
  // load json file to view/edit
  this.path = document.getElementById('path').value;
  this.name = document.getElementById('name').value;

  let jsonURL = this.path + this.name;
  document.getElementById("jsonURL").innerHTML = jsonURL;
  this.json = await this.proxy.getJSON(jsonURL);
  this.displayDetail();
}


async save(){ // appClass - clientside
  // navigate to selected object
  let obj = this.json;   // will be displayed in value
  let childNodes = document.getElementById("root").childNodes;  // should be <td> of <tr>
  let path="";
  for (var i = 0; i < childNodes.length; i++) {
     let value = childNodes[i].childNodes[0].value; // should be <slected>
     obj = obj[value];
     path += `["${value}"]`
  }

  // update object to new value
  obj = document.getElementById('value').value;
  eval(`this.json${path}=obj`);  // do not like eval, but do not know how to get arround lack of poitners.

  // save updated object back to server
  if (document.getElementById('format').checked) {
    obj = this.format.obj2string(this.json);
  } else {
    obj = JSON.stringify(this.json);
  }
  const msg = {
  "server":"web"
  ,"msg":"uploadFile"
  ,"path":`${this.path}`
  ,"name":`${this.name}`
  ,"data":`${obj}`
  }

  const resp = await app.proxy.postJSON(JSON.stringify(msg));  // save
  alert(JSON.stringify(resp));   // was it succussful
  location.reload();
  this.windowActive = false;
}


dataChanged(element){
  alert(element.innerHTML);
  alert(element.value);
}


displayDetail(  // appClass - clientside
  element  // DOM element clicked on
) {

  // save clicked attribute
  let obj = this.json;   // will be displayed in value
  let childNodes = document.getElementById("root").childNodes;  // should be <td> of <tr>
  for (var i = 0; i < childNodes.length; i++) {
     let e = childNodes[i].childNodes[3] // should be <slected>
     obj = obj[e.value];
     if (e === element) {
       // done - delete any remaining children
       this.menuDeleteTo(i);
     }
  }

  let html = `<input type="text" onblur="app.searchAttriute(this)"><br>
  <select  size=6 onchange="app.displayDetail(this)" style="width: 15ch">`;

  // build menu list with attribute name and type of value

  let enableSave = false;
  for (let key in obj) {
	  let value = obj[key];
	  if (obj.hasOwnProperty(key)) {
      let type = typeof(value);
      if (Array.isArray(value)) {
        type = `Array[${value.length}]`;
      } else if ("string" === type) {
        type = `string[${value.length}]`;
        enableSave = true;
      } else if ("number" === type) {
        // let type=number;
        enableSave = true;
      }

      // only allow save if we are changing a number or string.
      if (enableSave) {
        document.getElementById('save').style.visibility = 'visible';
      } else {
        document.getElementById('save').style.visibility = 'hidden';
      }

	    html += `<option value= "${key}"     >${key}:${type} </option>`;
	  }
	}

  // display selected attribute data in textarea
  if (typeof(obj) == "object") {
      document.getElementById("value").innerHTML         = JSON.stringify(        obj);
      document.getElementById("valueFormated").innerHTML = this.format.obj2string(obj);

      // add menu to select atributes
      const newMenue = document.createElement("td")
      newMenue.innerHTML = html + "</select>";
      document.getElementById('root').appendChild(newMenue);
  } else {
      document.getElementById("value").innerHTML = obj;
  }
}


searchAttriute(// appClass - clientside
  input  // input element
){
  alert(input.value);
}


menuDeleteTo(   // appClass - clientside
  index) {
  const e = document.getElementById('root');

  while ( index < e.childElementCount -1 ) {
    e.removeChild(e.lastElementChild);
  }
}


} // appClass - clientside  end
