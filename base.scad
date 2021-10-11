thickness = 1/8;
outer = 76;
inner = 69;


$fn=200;

module disk() {
	difference() {
		cylinder(r=76, h=thickness);
		translate([0,0,-thickness*10])
		cylinder(r=69, h=thickness*20);
	}
}

module tee() {
	len = (outer + inner);
	cube(size=[len, 8, thickness], center=true);
	rotate([0,0,90])
		cube(size=[len, 8, thickness], center=true);
}

module object() {
	difference() {
		union() {
			disk();
			tee();
		}
		translate([0,0,-thickness*10])
			cylinder(r=3/8, thickness*20);
	}
}

// object();

// http://rasterweb.net/raster/2012/07/16/openscad-to-dxf/
projection(cut=false) import("/Users/chet/code/couch/base.stl");
