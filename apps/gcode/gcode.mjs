export class gcode {
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

constructor(){
    this.test = false; // true -> keep the spende high, and do not turn it on
    this.code =    ""; // will hold generated gcode
}

rpm_clockwise(         speed){this.code_write(`M3 S${speed} (rpm clockwise)`);}
rpm_conunter_clockwise(speed){this.code_write(`M4 S${speed} (rpm counter clockwise)`);}
spindle_stop(               ){this.code_write(`M5 (stop the spindle)`          );}

inches(                     ){this.code_write(`G20 (inches)`);}
mm(                         ){this.code_write(`G21 (mm)`);}
feed_rate(         feed_rate){this.code_write(`F ${feed_rate} (feed rate/minute)`)}
gcode_end(         feed_rate){this.code_write(`M30 (end program)`)}

tool_diameter(tool_diameter) {
    this.tool_diameter = tool_diameter;
    this.tool_radius   = tool_diameter/2 ; //remember tool radious
}

test_set(boolean){this.test = boolean;}

code_get(){return this.code;}


code_write(code) {
    if (code[code.length-1] !== "\n") {
        code += "\n" // make sure line ends with new line
    }
    this.code += code;
}

code_get(){
    return this.code;
}



move_z(amount) {
    this.code_write(`G1 Z${amount}`);
}

move_xy(x,y) {
    this.code_write(`G1 X${x} Y(y)`);
}


circle(circle_diameter, depth, path){
    let circle_radius = circle_diameter/2;

    // assume tool is at center
    switch (path) {
    case "c": break; // tool center defines path 
    case "i": circle_radius += this.tool_radius; break; // inner circle path 
    case "o": circle_radius -= this.tool_radius; break; // outer circle path 
    default:
        // error
        
        break;
    }

    this.code_write(`
G91 (relative) (start circle)
G1 X-${circle_radius}  (goto far left of circle center)
G1 z-${depth}  (lower spindle)
G2 X0  ${circle_radius}  (go back to where you started to cut circle)
G90 (absolute, end circle)
    `);
}

} // end class




