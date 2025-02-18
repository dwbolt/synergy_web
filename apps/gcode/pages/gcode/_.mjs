import {gcode} from '/apps/gcode/gcode.mjs'        ; // static class that makes async webcalls
import {page_       } from '/_lib/UX/page_.mjs'     ;

export class circle  extends page_ {
    // assume mm

    /*
(position to circle of hole, assume w)
(tool diameter)
(offset, i-> tool inner diameter circle)
(offset, c-> tool path center will trace circle, default)
(offset, o-> tool outer center will trace circle)

G91 (relative)
G1 X-90  (goto far left of circle center)
G1 z-22  (lower spindle)
G2 X0  I90   (go back to where you started to cut circle)
G90 (absolute)

    */


async main(){
    this.z_raise      =               10; // amount to go above z0 to move to new location

    this.gcode = new gcode();

    this.gcode.comment("Make circle for lazy susan water despenser");
    this.gcode.mm();
    this.gcode.material_thickness(  12);  
    this.gcode.cutthrough(           1);   
    this.gcode.feed_rate_cut(  2000); // mm/min
    this.gcode.feed_rate_rapid(4000); // mm/min
    this.gcode.rpm_clockwise(12000); // turn on spindle at 12,000 rpm
    this.gcode.tool_diameter( this.gcode.inches_2_mm(.25) );  // 1/4 inch bit

 
    this.gcode.test_set(true);

    this.gcode.move_z(this.z_raise);
    this.gcode.move_xy(0,0);      // assume x0 y0 is where the center of the circle is

    this.gcode.circle(180,-12,"i");  // circle diamier is 180mm, material is 
    this.gcode.spindle_stop();

    this.gcode.move_z(this.z_raise);
    this.gcode.move_xy(0,0);
    this.gcode.gcode_end();

    const code = this.gcode.code_get();
    await navigator.clipboard.writeText(code)
    document.getElementById("gcode").innerText = code;
}


} // end class

  
try {
    const p= new circle() // create instance
    await p.init() ;   // init
    await p.main() ;   // generate gcode and display
  } catch (error)  {
    debugger;
    app.sfc_dialog.show_error( `error starting page, error=<br>${error}`);
  }