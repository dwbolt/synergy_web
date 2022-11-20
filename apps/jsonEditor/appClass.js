class appClass {  // appClass - clientside
/*

JSON editor

*/

constructor() {  // appClass - clientside
  this.json    = {}; // data we are view/edit
  this.changes = []; // list of changes since last save
  this.proxy   = new proxyClass(); // async load server files, json and html fragments
  this.format  = new formatClass();
  this.login   = new loginClass();
  this.changeLog = {};  // will contain change long, one
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


loginTrue(){  // appClass - clientside
  // show the load div
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
  document.getElementById('edit').style.visibility = "visible";  // show edit section of page
}


async save2Memory( // appClass - clientside
){ // save change to memory and update changeLog

  // build path to selected object
  const childNodes = document.getElementById("root").childNodes;  // should be <td> of <tr>
  let path="",value;
  for (var i = 0; i < childNodes.length; i++) {
     value = childNodes[i].lastChild.value; // should be <selected>
     path += `.${value}`
  }

  // remember old and new values, update to new value
  let valueNew = document.getElementById('value').value;
  let valueOld = eval(`this.json${path}`);
                 eval(`this.json${path}=valueNew`);  // do not like eval, but do not know how to get arround lack of poitners.

  // create/update change log;
  let logEntry = this.changeLog[path];  // get change log entry
  if (logEntry) {
    // log entry exists
    if (logEntry.firstChange === "update" && logEntry.fileValue === valueNew) {
      // was changed back to original, so delete change log entry
      delete this.changeLog[path];
      return;
    }
  } else {
    // new change so add, "firstChange" - create, update, delete an attribute
    logEntry = {"path":path, "firstChange":"update", "fileValue":valueOld};
  }

  // update
  logEntry.date        = new Date();
  logEntry.valueOld    = valueOld ;
  logEntry.valueNew    = valueNew;
  this.changeLog[path] = logEntry;
  document.getElementById('save2Server').style.visibility = ( (Object.keys(this.changeLog).length === 0     ) ? 'hidden'  : 'visible');
  document.getElementById("changes").value = this.format.obj2string(this.changeLog);
}


async save2Server(// appClass - clientside
){
  const obj = ((document.getElementById('format').checked) ? this.format.obj2string(this.json) : JSON.stringify(this.json)
  // save updated object back to server
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

  // need to upload change log;
  
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
  let childNodes = document.getElementById("root").childNodes;  // should be <td> of <tr>
  for (var i = 0; i < childNodes.length; i++) {
     let e = childNodes[i].lastChild // should be <slected>
     obj = obj[e.value];
     if (e === element) {
       // done - delete any remaining children
       this.menuDeleteTo(i);
     }
  }

  let html = `
  <input type="button" value="<" onclick="app.previous(this)">
  <input type="text"   size="15" onkeyup="app.searchAttriute(this)">
  <input type="button" value=">" onclick="app.next(this)"><br>
  <select  size=6 onclick="app.displayDetail(this)" style="width: 25ch">
  `;

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

  // show/hide save buttons
  document.getElementById('save2Memory').style.visibility = ( (0 <= ["string","number"].indexOf(typeof(obj))) ? 'visible' : 'hidden' );
  document.getElementById('save2Server').style.visibility = ( (Object.keys(this.changeLog).length === 0     ) ? 'hidden'  : 'visible');

  // display selected attribute data in textarea
  if (typeof(obj) == "object") {
    document.getElementById("value").value         = JSON.stringify(        obj);
    document.getElementById("valueFormated").value = this.format.obj2string(obj);
    // add menu to select atributes
    const newMenue = document.createElement("td")
    newMenue.innerHTML = html + "</select>";
    document.getElementById('root').appendChild(newMenue);
  } else {
    document.getElementById("value").value         = obj;
    document.getElementById("valueFormated").value = obj;
  }
}


searchAttriute(// appClass - clientside
  input  // input element - called on keypress
){
  const sel       = input.parentElement.lastChild;  // should be select dom
  const searchFor = input.value;                    // search values in select

  for(let i=0; i< sel.length; i++) {
    if (sel[i].value.toLowerCase().includes(searchFor)  ) {
      // found a match
      sel.value = sel[i].value; // select it
      app.displayDetail(sel);   // display interval
      break; // we are done
    }
  }
}


previous(  // appClass - clientside
button // button that was clicked
){
  const sel       = button.parentElement.lastChild;             // should be select dom
  const searchFor = button.parentElement.children[1].value;   // should be input text values in select

  for(let i=sel.selectedIndex-1; -1< i && i<sel.length ; i--) {
    if (sel[i].value.toLowerCase().includes(searchFor)  ) {
      // found a match, select
      sel.value = sel[i].value;
      app.displayDetail(sel);   // display interval
      break; // we are done
    }
  }
}


next(  // appClass - clientside
  button // button that was clicked
  ){

  const sel       = button.parentElement.lastChild;             // should be select dom
  const searchFor = button.parentElement.children[1].value;   // should be input text values in select

  for(let i=sel.selectedIndex+1; i< sel.length; i++) {
    if (sel[i].value.toLowerCase().includes(searchFor)  ) {
      // found a match, select
      sel.value = sel[i].value;
      app.displayDetail(sel);   // display interval
      break; // we are done
    }
  }

}


menuDeleteTo(   // appClass - clientside
  index // delete all memnues past index
) {
  const e = document.getElementById('root');

  while ( index < e.childElementCount -1 ) {
    e.removeChild(e.lastElementChild);
  }
}


} // appClass - clientside  end
