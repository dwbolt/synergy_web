 /*

show and add invoices

Data 

Current
invoice table
invoice_d table
group 
    record for Fish
    record for LCBC
    record for customers 

    
 */


 import {page_       } from '/UX/page_.mjs'
 import {table_class } from '/MVC/table/m.mjs'  ; 
 
 export class page_invoice extends page_ {
 

 async display(){  // force login to view page
     if ( !(await app.sfc_login.login_force( this.display.bind(this) )) ) {
             return; // login was not successfull, nothing todo
     }
 
     super.display();              //
 }
 

 async main() {
    // get tables
    this.invoice   = app.act.dbm.getTable("invoice"  ) ; // table model of invoice

    // display invoices
    const invoice_c   = document.getElementById("invoice"); // table controler/viewer
          invoice_c.set_model(this.invoice               ); // attach model to controls
          invoice_c.display(                             ); // display model data in controler/viewer
          this.table = invoice_c.shadow.getElementById('table')
          this.table.addEventListener('click', this.invoice_show.bind(this) );
 }
 

 invoice_show(event){
    // user clicked in the invoice table
    this.pk = event.target.getAttribute("data-pk");   // get pk of invoice to displauy
    if (this.pk) {
        // user clicked on pk to view record deta
        const collection = this.table.getElementsByClassName("link selected");
        for(let i=0; i<collection.length; i++) {
          collection[i].setAttribute("class","link")   // un-select any previous selection
        }
  
        event.target.setAttribute("class","link selected");   // add selected class to what the user clicked on

        // show invoice in a new window 
        const invoice_view = document.getElementById("invoice_view");  // get div to put printed invoice in
        invoice_view.innerHTML = this.invoice_template();
        this.invoice_fill();
    } 
 }


 invoice_fill() {
    // fill in invoice header detail
    const invoice                                   = this.invoice.get_object(this.pk);   
    document.getElementById("inv_number").innerHTML = invoice.invoice;
    document.getElementById("inv_due"   ).innerHTML = app.format.getISO(invoice.date_due);  // convert date to yyyy-mm-ddd
    document.getElementById("amount"    ).innerHTML = app.format.money(invoice.amount   );  // convert date to yyyy-mm-ddd

    document.getElementById("date_cleared").innerHTML = app.format.undefined_2_blank(invoice.date_cleared);
    document.getElementById("payment"     ).innerHTML = app.format.undefined_2_blank(invoice.payment);  // payment type
    document.getElementById("comment"     ).innerHTML = app.format.undefined_2_blank(invoice.comment); 

    // fill in customer info
    this.groups    = app.act.dbm.getTable("groups"   ) ; // table model of groups
    const customer = this.groups.get_object( Object.keys(invoice._relations.tables.groups)[0]);
    document.getElementById("customer").innerHTML = `${customer.name_full}<br>Short Name: ${customer.name_short}<br>Group PK: ${customer.pk}`;

    // display invoice details
    const invoice_d_m = app.act.dbm.getTable("invoice_d") ; // table model of invoice_d (detail)
    const invoice_d_c = document.getElementById("invoice_d");

    invoice_d_c.set_model( invoice_d_m                         ) ; // attach model to controls
    const pks  = this.invoice_d_m.search_equal("invoice",invoice.invoice) ; // should just retrun array of detail
    invoice_d_c.display(pks                                    ) ; // display model data in controler/viewer

    /*
    app.page.select = ["amount", "qty", "price", "item", "detail"] ; // fields to display
    app.page.searchVisible          = false                  ; // do not show search 
    app.page.setStatusLineData([]                           ); // gidrid of status line, next prev buttons etc....
    app.page.set_model(app.invoice_d,"invoice_d"            ); // attaching modle to viewer
    app.page.setSearchVisible(false                         );// disable search
    app.page.display(pks);
    */
 }


 invoice_template() {
    return `
  <div style="display:flex">

<div class="box" style=" margin-right: 50px;">
Sustainable Future Center<br>
201 Ogle Ave<br>
Knoxville, TN 37920<br>
<br>
<b>Contact:</b><br>
David Bolt<br>
David.Bolt@SFCknox.org<br>
865.603.0520 cell<br>
865.294.0154 office<br>
<br>
<b>Make Check to:</b><br>
Sustainable Future Center<br>
</div>

<div  style=" margin-right: 50px;"><img src="/logo.webp" alt="Sustainable Future Center Logo"></div>

<div  class="box">
<b>Invoice:</b> <span id="inv_number"></span><br>
<b>Due:</b> <span id="inv_due"></span><br>
<b>Amount:</b> <span id="amount"></span><br>
<br>
<b>Date Cleared:</b> <span id="date_cleared"></span><br>
<b>Payment Type:</b> <span id="payment"></span><br>
<b>Comment:</b> <span id="comment"></span><br>
<br>
<b>Customer</b><br>
<br>
<div id="customer"></div>
</div>

</div>
<sfc-table id="invoice_d"></sfc-table>
 `
 }

 print(){
    window.print();
 }

 } // end class 

 
try {
    const p= new page_invoice(); // create instance
    await p.init()             ; // display inital page,load web components
    await p.main()             ; // 
} catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
}
  
 