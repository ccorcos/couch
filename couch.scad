

mattress_length = 76;
mattress_width = 80;
mattress_height = 8;

mattress_center_y = mattress_width / 2;
mattress_center_x = mattress_length / 2;

mattress_space = 1.5;

fabric_margin = 6;
fabric_thickness = 0.1;

ply_thickness = 0.25;
frame_lumber_thickness = 1.5;
top_foam_thickness = 2;
side_foam_thickness = 0.5;

bed_frame_board_size = [2.5, 0.75];
bed_frame_base_boards = 7;
bed_frame_cross_boards = 17;

base_height = bed_frame_board_size[1] * 2 + mattress_height;

box_wooden_width = 8 - 2 * side_foam_thickness;
side_box_height = base_height + 9 - top_foam_thickness;
back_box_height = base_height + 19 - top_foam_thickness;
box_a_length = mattress_length + mattress_space + box_wooden_width;
box_b_length = mattress_width;

pillow_height = 19;
pillow_thickness = 6;
pillow_width = 40;

wedge_height = 10;
wedge_length = 14;
wedge_width = pillow_width;


inner_lumber_boards = 7;

show_fabric = false;

module bed_frame() {
    base_board_inc = (mattress_width - bed_frame_board_size[0]) / (bed_frame_base_boards - 1);
    for(x = [0 : base_board_inc : mattress_width]) {
        translate([0, x, 0])
        cube([mattress_length, bed_frame_board_size[0], bed_frame_board_size[1]]);
        echo("BOM: bed_frame_board", mattress_length);
    }

    cross_board_inc = (mattress_length - bed_frame_board_size[0]) / (bed_frame_cross_boards - 1);
    for(y = [0 : cross_board_inc : mattress_length]){
        translate([y, 0, bed_frame_board_size[1]])
        cube([bed_frame_board_size[0], mattress_width, bed_frame_board_size[1]]);
        echo("BOM: bed_frame_board", mattress_width);
    }
}

module mattress () {
    color("gray")
        translate([0,0,2*bed_frame_board_size[1]])
        cube([mattress_length, mattress_width, mattress_height]);

    module fabric() {
        fabric_size = [mattress_width + fabric_margin*2, mattress_length*2 + mattress_height*2 + fabric_margin*2];

        echo("BOM: fabric (mattress)", fabric_size[0], fabric_size[1]);
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

    feet_height = bed_frame_board_size[1];
    top_ply_size = [size[0], size[1]];
    top_foam_size = [size[0] + 2 * side_foam_thickness, size[1] + 2 * side_foam_thickness];
    side_ply_size = [size[0] - 2 * ply_thickness, size[2] - ply_thickness - feet_height];
    side_foam_size = [size[0], size[2] - feet_height];
    end_ply_size = [size[1], size[2] - ply_thickness - feet_height];
    end_foam_size = [size[1] + 2*side_foam_thickness, size[2] - feet_height];
    side_lumber_length = size[0] - 2 * ply_thickness;

    inner_width_lumber_length = size[1] - 2*frame_lumber_thickness - 2*ply_thickness;
    inner_height_lumber_length = size[2] - 2*frame_lumber_thickness - ply_thickness - feet_height;

    // NOTE: this calculation includes feet in the height!
    total_box_height = end_foam_size[1] + top_foam_thickness;
    total_box_length = top_foam_size[0];
    total_box_width = end_foam_size[0];
    total_side_height = side_foam_size[1] + top_foam_thickness;
    fabric_size = [2*fabric_margin + 2*total_side_height + total_box_width, 2*fabric_margin + 2*total_box_height + total_box_length ];

    module fabric() {
        echo("BOM: fabric (box)", fabric_size[0], fabric_size[1]);
        // pivot
        translate([side_foam_thickness,0,-total_box_height])  rotate([0,90,0]) translate([side_foam_thickness,0,-total_box_height])
        translate([-side_foam_thickness - fabric_thickness, -side_foam_thickness - fabric_thickness - fabric_margin - total_side_height, -fabric_margin])
        cube([fabric_thickness, fabric_size[0], fabric_size[1]]);
    }

    module top_ply() {
        echo("BOM: ply (box top)", top_ply_size[0], top_ply_size[1]);
        translate([0, 0, size[2] - ply_thickness])
           cube([top_ply_size[0], top_ply_size[1], ply_thickness]);
    }

    module top_foam() {
        echo("BOM: top_foam (box top)", top_foam_size[0], top_foam_size[1]);
        translate([-side_foam_thickness, -side_foam_thickness, size[2]])
           cube([top_foam_size[0], top_foam_size[1], top_foam_thickness]);
    }

    module side_ply() {
        echo("BOM: ply (box side)", side_ply_size[0], side_ply_size[1]);
        translate([ply_thickness, 0, feet_height])
            cube([side_ply_size[0], ply_thickness, side_ply_size[1]]);

        echo("BOM: ply (box side)", side_ply_size[0], side_ply_size[1]);
        translate([ply_thickness, size[1] - ply_thickness, feet_height])
            cube([side_ply_size[0], ply_thickness, side_ply_size[1]]);
    }

    module side_foam() {
        echo("BOM: side_foam (box side)", side_foam_size[0], side_foam_size[1]);
        translate([0, -side_foam_thickness, feet_height])
            cube([side_foam_size[0], side_foam_thickness, side_foam_size[1]]);

        echo("BOM: side_foam (box side)", side_foam_size[0], side_foam_size[1]);
        translate([0, size[1], feet_height])
            cube([side_foam_size[0], side_foam_thickness, side_foam_size[1]]);
    }

    module end_ply() {
        echo("BOM: ply (box end)", end_ply_size[0], end_ply_size[1]);
        translate([0, 0, feet_height])
            cube([ply_thickness, end_ply_size[0], end_ply_size[1]]);

        echo("BOM: ply (box end)", end_ply_size[0], end_ply_size[1]);
        translate([size[0] - ply_thickness, 0, feet_height])
            cube([ply_thickness, end_ply_size[0], end_ply_size[1]]);
    }

    module end_foam() {
        echo("BOM: side_foam (box end)", end_foam_size[0], end_foam_size[1]);
        translate([-side_foam_thickness, -side_foam_thickness, feet_height])
            cube([side_foam_thickness, end_foam_size[0], end_foam_size[1]]);

        echo("BOM: side_foam (box end)", end_foam_size[0], end_foam_size[1]);
        translate([size[0], -side_foam_thickness, feet_height])
            cube([side_foam_thickness, end_foam_size[0], end_foam_size[1]]);
    }

    module side_lumber() {
        echo("BOM: frame_lumber (side length)", side_lumber_length);
        translate([ply_thickness, ply_thickness, feet_height])
            cube([side_lumber_length, frame_lumber_thickness, frame_lumber_thickness]);
        echo("BOM: frame_lumber (side length)", side_lumber_length);
        translate([ply_thickness, ply_thickness, size[2] - ply_thickness - frame_lumber_thickness])
            cube([side_lumber_length, frame_lumber_thickness, frame_lumber_thickness]);
        echo("BOM: frame_lumber (side length)", side_lumber_length);
        translate([ply_thickness, size[1] - ply_thickness - frame_lumber_thickness, feet_height])
            cube([side_lumber_length, frame_lumber_thickness, frame_lumber_thickness]);
        echo("BOM: frame_lumber (side length)", side_lumber_length);
        translate([ply_thickness, size[1] - ply_thickness - frame_lumber_thickness, size[2] - ply_thickness - frame_lumber_thickness])
            cube([side_lumber_length, frame_lumber_thickness, frame_lumber_thickness]);
    }

    inner_inc = (size[0] - ply_thickness - ply_thickness - frame_lumber_thickness) / (inner_lumber_boards - 1);

    echo("inner_inc", inner_inc);

    module inner_width_lumber() {
        for(x = [0 : inner_inc : size[0] - ply_thickness]) {
            echo("BOM: frame_lumber (width length)", inner_width_lumber_length);
            translate([
                ply_thickness + x,
                ply_thickness + frame_lumber_thickness,
                feet_height
            ])
            cube([frame_lumber_thickness, inner_width_lumber_length, frame_lumber_thickness]);

            echo("BOM: frame_lumber (width)", inner_width_lumber_length);
            translate([
                ply_thickness + x,
                ply_thickness +
                frame_lumber_thickness, size[2] - frame_lumber_thickness - ply_thickness
            ])
            cube([frame_lumber_thickness, inner_width_lumber_length, frame_lumber_thickness]);
        }

    }

    module inner_height_lumber() {
        for(x = [0 : inner_inc : size[0] - ply_thickness]) {
            echo("BOM: frame_lumber (height)", inner_height_lumber_length);
            translate([
                ply_thickness + x,
                ply_thickness,
                frame_lumber_thickness + feet_height
            ])
            cube([frame_lumber_thickness, frame_lumber_thickness, inner_height_lumber_length]);

            echo("BOM: frame_lumber (height)", inner_height_lumber_length);
            translate([
                ply_thickness + x,
                size[1] - ply_thickness - frame_lumber_thickness,
                frame_lumber_thickness + feet_height
            ])
            cube([frame_lumber_thickness, frame_lumber_thickness, inner_height_lumber_length]);
        }
    }

    feet_inc = (size[0] - bed_frame_board_size[0]) / (inner_lumber_boards - 1);
    echo("feet_inc", feet_inc);
    module feet() {
        for(x = [0 : feet_inc : size[0] - ply_thickness]) {
            echo("BOM: bed_frame_board (box feet)", box_wooden_width);
            translate([x, 0, 0])
            cube([bed_frame_board_size[0], box_wooden_width, bed_frame_board_size[1]]);
        }
    }

    module ply() {
        color("blue") top_ply();
        color("blue") side_ply();
        color("blue") end_ply();
    }

    module lumber() {
        color("red") side_lumber();
        color("red") inner_width_lumber();
        color("red") inner_height_lumber();
    }

    module foam() {
        color("orange") top_foam();
        color("yellow") side_foam();
        color("yellow") end_foam();
    }


    // =======================================================
    // Visibility
    // =======================================================
    lumber();
    feet();
    // ply();
    // foam();

    if (show_fabric) {
        color("green") fabric();
    }
}

module box_a () {
    translate([0,-box_wooden_width - mattress_space,0])
        box([box_a_length, box_wooden_width, side_box_height]);
}

module box_a2 () {
    translate([0, mattress_width + mattress_space])
        box([box_a_length, box_wooden_width, side_box_height]);
}

module box_b () {
    translate([mattress_length + mattress_space, 0])
        rotate([0,0,90])
        translate([0,-box_wooden_width,0])
        box([box_b_length, box_wooden_width, back_box_height]);
}


module pillow() {
    echo("BOM: pillow_foam", pillow_thickness, pillow_width, pillow_height);
    echo("BOM: fabric (pillow)", 2*pillow_height + 2*pillow_thickness + 2*fabric_margin, 2*pillow_thickness + 2*fabric_margin + pillow_width);

    color("purple")
    translate([mattress_length - pillow_thickness,0,base_height])
    cube([pillow_thickness, pillow_width, pillow_height]);
}

module wedge(tall) {
    triangle_points =[[0,0], [wedge_height,0], [0,wedge_length]];
    triangle_paths =[[0,1,2]];

    echo("BOM: wedge_foam ", wedge_height, wedge_length);
    echo("BOM: fabric (wedge)", wedge_height + wedge_length + sqrt(wedge_height*wedge_height + wedge_length*wedge_length) + 2*fabric_margin, pillow_width + wedge_height + 2*fabric_margin);

    if (tall) {
        color("pink")
        translate([mattress_length - pillow_thickness,0,base_height])
        rotate([90,0,180])
        linear_extrude(wedge_width)
        polygon(triangle_points,triangle_paths);
    } else {
        color("pink")
        translate([mattress_length - pillow_thickness,0,base_height])
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


extra = (mattress_space + box_wooden_width) / 2;
center_x = mattress_center_x + extra;
center_y = mattress_center_y;

base_x1 = - box_wooden_width - mattress_space;
base_x2 = mattress_width + box_wooden_width + mattress_space;
base_y1 = 0;
base_y2 = mattress_length + box_wooden_width + mattress_space;

sheet_metal_thickness = 0.1;
plate_metal_thickness = 0.2;
base_gap = 0.1;

plate_width = 2;

module turntableBase() {
    dy = base_y2 - base_y1;
    dx = base_x2 - base_x1;

    cube([dy, dx, sheet_metal_thickness]);

    translate([0, 0, -plate_width])
    cube([dy, plate_metal_thickness, plate_width]);

    translate([0, dx, -plate_width])
    cube([dy, plate_metal_thickness, plate_width]);

    translate([0, 0, -plate_width])
    cube([plate_metal_thickness, dx, plate_width]);

    translate([dy, 0, -plate_width])
    cube([plate_metal_thickness, dx, plate_width]);

}


module turntable() {
    color("green", 0.6)
    translate([0, base_x1, -sheet_metal_thickness - base_gap])
    turntableBase();

    // $fn = 64;

    // radius = 42;


    // color("blue")
    // translate([center_x, center_y, -1])
    // cylinder(1, radius, true);

    // wheel_spacing = 8;

    // for(r = [0 : wheel_spacing : radius - 1]) {
    //     arc_length = 2*PI*r;
    //     n_wheels = ceil(arc_length / wheel_spacing);
    //     for (n = [0 : 1: n_wheels]) {
    //         color("green")
    //         translate([center_x, center_y, -2])
    //         rotate([0,0,360/n_wheels*n])
    //         translate([r,0,0])
    //         cylinder(1, 1, true);
    //         i = i + 1;
    //     }
    // }

}

module outline() {
    bed_frame();

    //mattress();
    //pillow();
    //pillow_2();
    //wedge(false);
    //wedge_2(true);

    box_a();
    box_a2();
    box_b();

    turntable();




    // Jump to Visibility section.
}

outline();
