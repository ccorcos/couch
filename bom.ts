import * as fs from "fs-extra"
import * as _ from "lodash"
import { howToCutBoards1D } from "stock-cutting"

async function main() {
	const logs = await fs.readFile("./logs.txt", "utf8")
	const lines = logs.split("\n").filter(line => line.indexOf("BOM:") !== -1)

	// Regex to match groups based on the echo BOM format.
	// "BOM: <NAME> (OPTIONAL LABEL)", <VALUE>
	const matches = lines.map(
		line => /BOM: ([^\(" ]+) ?(\([^\)]+\))?", (.*)/.exec(line) as Array<any>
	)

	const parsed = matches.map(([match, name, label, size]) => {
		label = label ? label.slice(1, -1) : undefined
		size = size.split(",").map(x => parseFloat(x.trim()))
		size = size.length === 1 ? size[0] : size
		return { name, label, size } as {
			name: string
			label: string | undefined
			size: number
		}
	})

	const groups = _.groupBy(parsed, item => item.name)

	// [ { size: 7, count: 21 },
	// 	{ size: 76, count: 17 },
	// 	{ size: 80, count: 7 } ]
	const bedFrameBoard = _.values(
		_.groupBy(groups.bed_frame_board, item => item.size)
	).map(arr => ({ size: arr[0].size, count: arr.length }))

	// 8ft boards at Lowes.
	const bedFrameBoardResult = howToCutBoards1D(12 * 8, bedFrameBoard)

	console.log(
		"You will need to buy",
		_.sum(bedFrameBoardResult.map(({ count }) => count)),
		"bed frame boards"
	)
	// console.log(bedFrameBoardResult)

	// [ { size: 11, count: 28 },
	// 	{ size: 21, count: 14 },
	// 	{ size: 84, count: 8 },
	// 	{ size: 3.5, count: 42 },
	// 	{ size: 79.5, count: 4 } ]
	const frameLumber = _.values(
		_.groupBy(groups.frame_lumber, item => item.size)
	).map(arr => ({ size: arr[0].size, count: arr.length }))

	// 8ft boards at Lowes.
	const boxFrameResult = howToCutBoards1D(12 * 8, frameLumber)

	console.log(frameLumber, boxFrameResult)

	// Hmm. They're fractions! Waiting on this issue.
	// https://github.com/JWally/jsLPSolver/issues/84

	console.log(
		"You will need to buy",
		_.sum(boxFrameResult.map(({ count }) => count)),
		"box frame boards"
	)
	// console.log(boxFrameResult)

	// TODO
	// 2D
	// ply
	// foams!
}

main()
