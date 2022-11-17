class appClass {


constructor() {  // appClass - clientside
  this.json    = {}; // data we are view/edit
  this.changes = []; // list of changes since last save
  this.proxy   = new proxyClass(); // async load server files, json and html fragments
  this.format  = new formatClass();
  this.login   = new loginClass();
}

main() {  // appClass - clientside
  this.login.loginTrue = app.loginTrue;  // set callback function

  // set path and name to default or get from URL
  const urlParams = new URLSearchParams( window.location.search );
  let parm = urlParams.get('path');
  if ( parm != null)  {
    // set path to one on url
    document.getElementById('path').value = param;
  }
  parm = urlParams.get('name') ;
  if ( parm != null)  {
    // set file name to one on url
    document.getElementById('name').value = parm;
  }
}


loginTrue(){
  // show
  document.getElementById('load').style.visibility = "visible";
}


async loadJSON(){ // appClass - clientside
  // load json file to view/edit
  this.path = document.getElementById('path').value;
  this.name = document.getElementById('name').value;

  let jsonURL = this.path + this.name;
  document.getElementById("jsonURL").innerHTML = "Editing File: " + jsonURL;
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

  // delete menu past selection, narrow obj to one clicked on
  //this.menuDeleteTo(element.parentElement.childElementCount);
  let childNodes = document.getElementById("root").childNodes;  // should be <td> of <tr>
  for (var i = 0; i < childNodes.length; i++) {
     let e = childNodes[i].lastChild // should be <slected>
     obj = obj[e.value];
     if (e === element) {
       // done - delete any remaining children
       this.menuDeleteTo(i);
     }
  }

  let html = `<input type="text" onblur="app.searchAttriute(this)"><br>
  <select  size=6 onchange="app.displayDetail(this)" style="width: 25ch">`;

  // build menu list with attribute name and type of value
  for (let key in obj) {
	  let value = obj[key];
	  if (obj.hasOwnProperty(key)) {
      let type = typeof(value);
      if (Array.isArray(value)) {
        type = `Array[${value.length}]`;
      } else if ("string" === type) {
        type = `string[${value.length}]`;
      } else if ("number" === type) {
        // let type=number;
        type = `number`;
      }

	    html += `<option value= "${key}"     >${key}:${type} </option>`;
	  }
	}

  if ( 0 <= ["string","number"].indexOf(typeof(obj))  ) {
    // only allow save if we are changing a number or string.
    document.getElementById('save').style.visibility = 'visible';
  } else {
    document.getElementById('save').style.visibility = 'hidden';
  }

  // show/hide save button
  let enableSave = false;  // disable the save button

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
  const sel       = input.parentElement.lastChild;  // should be select dom
  const searchFor = input.value;                    // search values in select

  for(let i=0; i< sel.length; i++) {
    sel[i].value;
  }

}


menuDeleteTo(   // appClass - clientside
  index) {
  const e = document.getElementById('root');

  while ( index < e.childElementCount -1 ) {
    e.removeChild(e.lastElementChild);
  }
}


} // appClass - clientside  end
