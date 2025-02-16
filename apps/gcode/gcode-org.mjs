class gcode {
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

constructor(tool_diameter){
    this.tool_radious = tool_diameter/2 ; //remember tool radious
    this.feed_rate    =             2000; // mm/min
    this.z_raise      =               10; // amount to go above z0 to move to new location
    this.test         =            false; // true -> keep the spende high, and do not turn it on
}


main(){
    // assume x0 y0 is where the 
    this.test(true);
    this.spindle_raise();
    this.move(0,0);

    this.circle(90,-12);
    this.spindle_raise();
    this.spindle_stope();
    this.move(0,0);
}


code_write(gcode){
    console.log(gcode);  // out put gcode to console
}


z_raise(amount) {

    if (amount === undefined) {
        amount = this.z_raise;
    }
    code_write(`G1 Z${amount}`);
}


circle(circle_diameter, depth, path){
    circle_radius = circle_diameter/2;


    // assume tool is at center
    switch (path) {
    case "c": break; // tool center defines path 
    case "i": break; // tool center defines path 
    default:
        break;
    }



    this.code_write(`
G91 (relative)
G1 X-${circle_radius}  (goto far left of circle center)
G1 z-${depth}  (lower spindle)
G2 X0  ${circle_radius}  (go back to where you started to cut circle)
G90 (absolute)
    `);
}

}

new gcode(6.35).main; // 1/4 inch bit
