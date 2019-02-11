import * as fs from "fs-extra"
import * as _ from "lodash"
import { howToCutBoards1D, howToCutBoards2D, StockSize2D } from "stock-cutting"

function accumulatePieces<Size>(
	pieces: Array<Piece<Size>>,
	serializeSize: (size: Size) => number | string
) {
	return _.values(_.groupBy(pieces, item => serializeSize(item.size))).map(
		arr => ({
			size: arr[0].size,
			count: arr.length,
		})
	)
}

type Piece<Size> = {
	name: string
	label: string | undefined
	size: Size
}

type Piece1D = Piece<number>
type Piece2D = Piece<[number, number]>

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
		return { name, label, size }
	})

	const groups: {
		bed_frame_board: Array<Piece1D>
		frame_lumber: Array<Piece1D>
		fabric: Array<Piece2D>
		ply: Array<Piece2D>
		top_foam: Array<Piece2D>
		side_foam: Array<Piece2D>
		wedge_foam: null // ignore
		pillow_foam: null // ignore
	} = _.groupBy(parsed, item => item.name) as any

	const bladeSize = 0.125

	// 2" HD36-R https://www.foambymail.com/HDR_1/hd36-regular-foam.html
	const stockSizes = [
		{ size: [82, 76], cost: 61 } as StockSize2D,
		{ size: [82, 36], cost: 31 } as StockSize2D,
		{ size: [82, 24], cost: 21 } as StockSize2D,
	]

	const requiredCuts = accumulatePieces(groups.side_foam, size =>
		size.sort().join("")
	).map(cut => ({
		...cut,
		// truncate to the max size of the board.
		size: cut.size.map(i => Math.min(i, 82)) as [number, number],
	}))
	console.log(requiredCuts)

	howToCutBoards2D({
		stockSizes: stockSizes,
		bladeSize: bladeSize,
		requiredCuts: requiredCuts,
	})

	// // console.log(Object.keys(groups))
	// // [  ]

	// const bedFrameBoardRequirements = accumulatePieces(groups.bed_frame_board)
	// // console.log(bedFrameBoardRequirements)
	// // [ { size: 7, count: 21 },
	// // 	{ size: 76, count: 17 },
	// // 	{ size: 80, count: 7 } ]

	// const bedFrameBoardResult = howToCutBoards1D({
	// 	stockSizes: [{ size: 12 * 8, cost: 1 }, { size: 12 * 2, cost: 1 / 4 }],
	// 	bladeSize: bladeSize,
	// 	requiredCuts: bedFrameBoardRequirements,
	// })
	// const totalNumberOfStockBedFrameBoards = _.sum(
	// 	bedFrameBoardResult.map(({ count }) => count)
	// )

	// const boxFrameRequirements = accumulatePieces(groups.frame_lumber)
	// // console.log(boxFrameRequirements)
	// // [ { size: 11, count: 28 },
	// // 	{ size: 21, count: 14 },
	// // 	{ size: 84, count: 8 },
	// // 	{ size: 3.5, count: 42 },
	// // 	{ size: 79.5, count: 4 } ]

	// const boxFrameResult = howToCutBoards1D({
	// 	stockSizes: [{ size: 12 * 8, cost: 1 }, { size: 12 * 2, cost: 1 / 5 }],
	// 	bladeSize: bladeSize,
	// 	requiredCuts: boxFrameRequirements,
	// })
	// const totalNumberOfBoxFrameBoards = _.sum(
	// 	bedFrameBoardResult.map(({ count }) => count)
	// )

	// // Log results!
	// console.log(
	// 	JSON.stringify(
	// 		{
	// 			bed_frame_board: {
	// 				total: totalNumberOfStockBedFrameBoards,
	// 				cuts: bedFrameBoardResult,
	// 			},
	// 			frame_lumber: {
	// 				total: totalNumberOfBoxFrameBoards,
	// 				cuts: boxFrameResult,
	// 			},
	// 		},
	// 		null,
	// 		2
	// 	)
	// )
}

main()
