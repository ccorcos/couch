import * as fs from "fs-extra"
import * as _ from "lodash"
import { howToCutBoards1D } from "stock-cutting"

function accumulatePieces(pieces: Array<Piece>) {
	return _.values(_.groupBy(pieces, item => item.size)).map(arr => ({
		size: arr[0].size,
		count: arr.length,
	}))
}

interface Piece {
	name: string
	label: string | undefined
	size: number
}

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
		return { name, label, size } as Piece
	})

	const groups = _.groupBy(parsed, item => item.name)

	// console.log(Object.keys(groups))
	// [ 'bed_frame_board', 'pillow_foam', 'fabric', 'wedge_foam', 'frame_lumber', 'ply', 'top_foam', 'side_foam' ]

	const bedFrameBoardRequirements = accumulatePieces(groups.bed_frame_board)
	// console.log(bedFrameBoardRequirements)
	// [ { size: 7, count: 21 },
	// 	{ size: 76, count: 17 },
	// 	{ size: 80, count: 7 } ]

	const bladeSize = 0.125

	const bedFrameBoardResult = howToCutBoards1D({
		stockSizes: [{ size: 12 * 8, cost: 1 }, { size: 12 * 2, cost: 1 / 4 }],
		bladeSize: bladeSize,
		requiredCuts: bedFrameBoardRequirements,
	})
	const totalNumberOfStockBedFrameBoards = _.sum(
		bedFrameBoardResult.map(({ count }) => count)
	)

	const boxFrameRequirements = accumulatePieces(groups.frame_lumber)
	// console.log(boxFrameRequirements)
	// [ { size: 11, count: 28 },
	// 	{ size: 21, count: 14 },
	// 	{ size: 84, count: 8 },
	// 	{ size: 3.5, count: 42 },
	// 	{ size: 79.5, count: 4 } ]

	const boxFrameResult = howToCutBoards1D({
		stockSizes: [{ size: 12 * 8, cost: 1 }, { size: 12 * 2, cost: 1 / 5 }],
		bladeSize: bladeSize,
		requiredCuts: boxFrameRequirements,
	})
	const totalNumberOfBoxFrameBoards = _.sum(
		bedFrameBoardResult.map(({ count }) => count)
	)

	// Log results!
	console.log(
		JSON.stringify(
			{
				bed_frame_board: {
					total: totalNumberOfStockBedFrameBoards,
					cuts: bedFrameBoardResult,
				},
				frame_lumber: {
					total: totalNumberOfBoxFrameBoards,
					cuts: boxFrameResult,
				},
			},
			null,
			2
		)
	)
}

main()
