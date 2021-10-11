import * as fs from "fs"
import * as _ from "lodash"

const logs = fs.readFileSync("./logs.txt", "utf8")
const lines = logs.split("\n").filter((line) => line.indexOf("BOM:") !== -1)

const matches = lines.map(
	(line) => /BOM: ([^\(" ]+) ?(\([^\)]+\))?", (.*)/.exec(line) as Array<any>
)

const parsed = matches.map(([match, name, label, size]) => {
	label = label ? label.slice(1, -1) : undefined
	size = size.split(",").map((x) => parseFloat(x.trim()))
	size = size.length === 1 ? size[0] : size
	return { name, label, size }
})

type Piece<Size> = {
	name: string
	label: string | undefined
	size: Size
}

type Piece1D = Piece<number>
type Piece2D = Piece<[number, number]>

const groups: {
	bed_frame_board: Array<Piece1D>
	frame_lumber: Array<Piece1D>
	fabric: Array<Piece2D>
	ply: Array<Piece2D>
	top_foam: Array<Piece2D>
	side_foam: Array<Piece2D>
	wedge_foam: null // ignore
	pillow_foam: null // ignore
} = _.groupBy(parsed, (item) => item.name) as any

// https://roofonline.com/weight-of-dimensional-lumber
// bed_frame_board 1x3 => 0.44 lb/ft
// 2x2 frame_lumber => 0.62 lb/ft
// https://www.inchcalculator.com/how-much-does-plywood-weigh/
// ply_thickness 0.25 thick => 25/32 lb/ft^2

const bedFrameWeight =
	(_.sum(groups.bed_frame_board.map((x) => x.size)) * 0.44) / 12

const boxFrameWeight =
	(_.sum(groups.frame_lumber.map((x) => x.size)) * 0.62) / 12

const plyWeight =
	(_.sum(groups.ply.map((x) => x.size[0] * x.size[1])) * 25) / 32 / 12 / 12

console.log("bedFrameWeight:", bedFrameWeight)
console.log("boxFrameWeight:", boxFrameWeight)
console.log("plyWeight:", plyWeight)
// top_foam + side_foam 15lbs
// mattress_foam ~30lbs
// fabric ~15lbs

console.log("total:", bedFrameWeight + boxFrameWeight + plyWeight + 60)
// ~300lbs
