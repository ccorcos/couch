import * as fs from "fs-extra"
import * as _ from "lodash"
import {
	howToCutBoards1D,
	howToCutBoards2D,
	StockSize2D,
	isEqual2D,
} from "stock-cutting"

function accumulatePieces<Size>(
	pieces: Array<Piece<Size>>,
	serializeSize?: (size: Size) => number | string
) {
	return _.values(
		_.groupBy(pieces, item => (serializeSize || _.identity)(item.size))
	).map(arr => ({
		size: arr[0].size,
		count: arr.length,
	}))
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

	const bedFrameBoardRequirements = accumulatePieces(groups.bed_frame_board)
	const bedFrameBoardResult = howToCutBoards1D({
		stockSizes: [{ size: 12 * 8, cost: 1 }],
		bladeSize: bladeSize,
		requiredCuts: bedFrameBoardRequirements,
	})
	const totalNumberOfStockBedFrameBoards = _.sum(
		bedFrameBoardResult.map(({ count }) => count)
	)

	const boxFrameRequirements = accumulatePieces(groups.frame_lumber)
	const boxFrameResult = howToCutBoards1D({
		stockSizes: [{ size: 12 * 8, cost: 1 }],
		bladeSize: bladeSize,
		requiredCuts: boxFrameRequirements,
	})
	const totalNumberOfBoxFrameBoards = _.sum(
		bedFrameBoardResult.map(({ count }) => count)
	)

	console.log(
		JSON.stringify(
			{
				"2d": {
					ply: accumulatePieces(groups.ply, size => size.join(",")),
					top_foam: accumulatePieces(groups.top_foam, size => size.join(",")),
					side_foam: accumulatePieces(groups.side_foam, size => size.join(",")),
				},
				"1d": {
					bed_frame_board: {
						total: totalNumberOfStockBedFrameBoards,
						requirements: bedFrameBoardRequirements,
						cuts: bedFrameBoardResult,
					},
					frame_lumber: {
						total: totalNumberOfBoxFrameBoards,
						requirements: boxFrameRequirements,
						cuts: boxFrameResult,
					},
				},
			},
			null,
			2
		)
	)
}

main()
