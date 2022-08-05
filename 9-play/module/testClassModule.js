export default class testClass {

constructor() {
  this.name ="david";
}


displayName(idDOM) {
  document.getElementById(idDOM).innerHTML = `<br>${this.name}`;
}


}
