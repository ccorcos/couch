
mattress_length = 76;
mattress_width = 80;
mattress_height = 10;

mattress_space = 1.5;

fabric_margin = 6;
fabric_thickness = 0.1;

ply_thickness = 0.5;
lumber_thickness = 1.5;
top_foam_thickness = 2;
side_foam_thickness = 0.5;

box_width = 8 - 2 * side_foam_thickness;
side_box_height = mattress_height + 9 - top_foam_thickness;
back_box_height = mattress_height + 19 - top_foam_thickness;
box_a_length = mattress_length + mattress_space + box_width;
box_b_length = mattress_width;

pillow_height = 19;
pillow_thickness = 6;
pillow_width = 40;

wedge_height = 10;
wedge_length = 14;
wedge_width = pillow_width;

show_fabric = false;

module mattress () {
    color("gray") cube([mattress_length, mattress_width, mattress_height]);
    
    module fabric() {
        fabric_size = [mattress_width + fabric_margin*2, mattress_length*2 + mattress_height*2 + fabric_margin*2];
    
        echo("1x mattress fabric", fabric_size[0], fabric_size[1]);
        translate([-fabric_margin,-fabric_margin,-mattress_height])
        cube([
            fabric_size[0],
            fabric_size[1], 
            fabric_thickness
        ]);
    }
    
    if (show_fabric) {
        color("green") fabric();         
    }   
}


module box(size) {

    top_ply_size = [size[0], size[1]];
    top_foam_size = [size[0] + 2 * side_foam_thickness, size[1] + 2 * side_foam_thickness];
    side_ply_size = [size[0] - 2 * ply_thickness, size[2] - ply_thickness];
    side_foam_size = [size[0], size[2]];
    end_ply_size = [size[1], size[2] - ply_thickness];
    end_foam_size = [size[1] + 2*side_foam_thickness, size[2]];
    side_lumber_length = size[0] - 2 * ply_thickness;
    end_width_lumber_length = size[1] - 2*lumber_thickness - 2*ply_thickness;
    end_height_lumber_length = size[2] - 2*lumber_thickness - ply_thickness;
    
    
    total_box_height = end_foam_size[1] + top_foam_thickness;
    total_box_length = top_foam_size[0];
    total_box_width = end_foam_size[0];
    total_side_height = side_foam_size[1] + top_foam_thickness;
    fabric_size = [2*fabric_margin + 2*total_side_height + total_box_width, 2*fabric_margin + 2*total_box_height + total_box_length ];
    
    module fabric() {
        echo("1x box fabric", fabric_size[0], fabric_size[1]);
        // pivot
        translate([side_foam_thickness,0,-total_box_height])  rotate([0,90,0]) translate([side_foam_thickness,0,-total_box_height]) 
        translate([-side_foam_thickness - fabric_thickness, -side_foam_thickness - fabric_thickness - fabric_margin - total_side_height, -fabric_margin])
        cube([fabric_thickness, fabric_size[0], fabric_size[1]]);
    }
    

    module top_ply() {
        echo("1x top ply", top_ply_size[0], top_ply_size[1]);
        translate([0, 0, size[2] - ply_thickness])
           cube([top_ply_size[0], top_ply_size[1], ply_thickness]);
    }

    module top_foam() {
        echo("1x top foam", top_foam_size[0], top_foam_size[1]);
        translate([-side_foam_thickness, -side_foam_thickness, size[2]])
           cube([top_foam_size[0], top_foam_size[1], top_foam_thickness]);
    }

    module side_ply() {
        echo("2x side ply", side_ply_size[0], side_ply_size[1]);
        translate([ply_thickness, 0, 0])
            cube([side_ply_size[0], ply_thickness, side_ply_size[1]]);
        translate([ply_thickness, size[1] - ply_thickness, 0])
            cube([side_ply_size[0], ply_thickness, side_ply_size[1]]);
    }

    module side_foam() {
        echo("2x side foam", side_foam_size[0], side_foam_size[1]);
        translate([0, -side_foam_thickness, 0])
            cube([side_foam_size[0], ply_thickness, side_foam_size[1]]);
        translate([0, size[1], 0])
            cube([side_foam_size[0], ply_thickness, side_foam_size[1]]);
    }

    module end_ply() {
        echo("2x end ply", end_ply_size[0], end_ply_size[1]);
        cube([ply_thickness, end_ply_size[0], end_ply_size[1]]);
        translate([size[0] - ply_thickness, 0, 0])
            cube([ply_thickness, end_ply_size[0], end_ply_size[1]]);

    }

    module end_foam() {
        echo("2x end foam", end_foam_size[0], end_foam_size[1]);
        translate([-side_foam_thickness, -side_foam_thickness,0])
        cube([ply_thickness, end_foam_size[0], end_foam_size[1]]);
        translate([size[0], -side_foam_thickness, 0])
            cube([ply_thickness, end_foam_size[0], end_foam_size[1]]);
    }

    module side_lumber() {
        echo("4x side lumber", side_lumber_length);
        translate([ply_thickness, ply_thickness, 0])
            cube([side_lumber_length, lumber_thickness, lumber_thickness]);
        translate([ply_thickness, ply_thickness, size[2] - ply_thickness - lumber_thickness])
            cube([side_lumber_length, lumber_thickness, lumber_thickness]);
        translate([ply_thickness, size[1] - ply_thickness - lumber_thickness, 0])
            cube([side_lumber_length, lumber_thickness, lumber_thickness]);
        translate([ply_thickness, size[1] - ply_thickness - lumber_thickness, size[2] - ply_thickness - lumber_thickness])
            cube([side_lumber_length, lumber_thickness, lumber_thickness]);
    }

    module end_width_lumber() {
        echo("4x end width lumber", end_width_lumber_length);
        translate([ply_thickness, ply_thickness + lumber_thickness])
            cube([lumber_thickness, end_width_lumber_length,lumber_thickness]);
        translate([ply_thickness, ply_thickness + lumber_thickness, size[2] - lumber_thickness - ply_thickness])
            cube([lumber_thickness, end_width_lumber_length,lumber_thickness]);
        translate([size[0] - ply_thickness - lumber_thickness, ply_thickness + lumber_thickness])
            cube([lumber_thickness, end_width_lumber_length,lumber_thickness]);
        translate([size[0] - ply_thickness - lumber_thickness, ply_thickness + lumber_thickness, size[2] - lumber_thickness - ply_thickness])
            cube([lumber_thickness, end_width_lumber_length,lumber_thickness]);
    }

    module end_height_lumber() {
        echo("4x end height lumber", end_height_lumber_length);
        translate([ply_thickness, ply_thickness, lumber_thickness])
            cube([lumber_thickness, lumber_thickness, end_height_lumber_length]);
        translate([ply_thickness, size[1] - ply_thickness - lumber_thickness, lumber_thickness])
            cube([lumber_thickness, lumber_thickness, end_height_lumber_length]);
        translate([size[0] - ply_thickness - lumber_thickness, ply_thickness, lumber_thickness])
            cube([lumber_thickness, lumber_thickness, end_height_lumber_length]);
        translate([size[0] - ply_thickness - lumber_thickness, size[1] - ply_thickness - lumber_thickness, lumber_thickness])
            cube([lumber_thickness, lumber_thickness, end_height_lumber_length]);

    }

    module ply() {
        color("blue") top_ply();
        color("blue") side_ply();
        color("blue") end_ply();
    }

    module lumber() {
        color("red") side_lumber();
        color("red") end_width_lumber();
        color("red") end_height_lumber();
    }

    module foam() {
        color("orange") top_foam();
        color("yellow") side_foam();
        color("yellow") end_foam();
    }

    ply();
    lumber();
    foam();
    
    if (show_fabric) {
        color("green") fabric();
    }
}

module box_a () {
    translate([0,-box_width - mattress_space,0])
        box([box_a_length, box_width, side_box_height]);
}

module box_a2 () {
    translate([0, mattress_width + mattress_space])
        box([box_a_length, box_width, side_box_height]);
}

module box_b () {
    translate([mattress_length + mattress_space, 0])
        rotate([0,0,90])
        translate([0,-box_width,0])
        box([box_b_length, box_width, back_box_height]);
}


module pillow() {
    echo("1x pillow foam", pillow_thickness, pillow_width, pillow_height);
    echo("1x pillow fabric", 2*pillow_height + 2*pillow_thickness + 2*fabric_margin, 2*pillow_thickness + 2*fabric_margin + pillow_width);
    
    color("purple")
    translate([mattress_length - pillow_thickness,0,mattress_height])
    cube([pillow_thickness, pillow_width, pillow_height]);    
}

module wedge(tall) {
    triangle_points =[[0,0], [wedge_height,0], [0,wedge_length]];
    triangle_paths =[[0,1,2]];
    
    echo("1x wedge foam", wedge_height, wedge_length);
    echo("1x wedge fabric", wedge_height + wedge_length + sqrt(wedge_height*wedge_height + wedge_length*wedge_length) + 2*fabric_margin, pillow_width + wedge_height + 2*fabric_margin);
    
    if (tall) {
        color("pink")
        translate([mattress_length - pillow_thickness,0,mattress_height])
        rotate([90,0,180])
        linear_extrude(wedge_width)
        polygon(triangle_points,triangle_paths);
    } else {
        color("pink")
        translate([mattress_length - pillow_thickness,0,mattress_height])
        translate([0,wedge_width,0]) rotate([90,-90,0])
        linear_extrude(wedge_width)
        polygon(triangle_points,triangle_paths);
    }
}

module pillow_2() {
    translate([0, pillow_width]) pillow();
}

module wedge_2(tall) {
    translate([0, pillow_width]) wedge(tall);
}


module outline() {
    mattress();
    box_a();
    box_a2();
    box_b();
    pillow();
    wedge(false);
    pillow_2();
    wedge_2(true);
}

outline();






