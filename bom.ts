import * as fs from "fs-extra"
import * as _ from "lodash"
import * as solver from "javascript-lp-solver/src/solver"
import * as util from "util"

/**
 * Given a board of `size` and a list of `cuts` you
 * can make out of the board, how many unique ways of cutting the board
 * are there?
 */
function howManyWays(
	size: number,
	cuts: Array<number>,
	state: Array<number> = []
): Array<Array<number>> {
	return _.flatten(
		cuts.map(cut => {
			const remainder = size - cut
			if (remainder >= 0) {
				return _.uniqWith(
					howManyWays(remainder, cuts, [...state, cut].sort()),
					(x, y) =>
						_.difference(x, y).length === 0 || _.difference(y, x).length === 0
				)
			} else {
				return [state]
			}
		})
	)
}

type RequiredCuts = Array<{ size: number; count: number }>
type ResultCuts = Array<{ count: number; cuts: Array<number> }>

function howToCutBoards1D(
	stockSize: number,
	requiredCuts: RequiredCuts
): ResultCuts {
	const cutSizes = requiredCuts.map(({ size }) => size)

	const waysOfCutting = howManyWays(stockSize, cutSizes)

	// Transform [1,1,2,3] into {cut1: 2, cut2: 1, cut3: 3}.
	// Each will be the different versions of cutting the stock board.
	const stockVersions = waysOfCutting.map(way => {
		const stockCut = {}
		for (const cut of cutSizes) {
			stockCut["cut" + cut] = 0
		}
		for (const cut of way) {
			stockCut["cut" + cut] = stockCut["cut" + cut] + 1
		}
		return stockCut
	})

	// Create a variable for each version with a count: 1 which we will minimize.
	const variables = stockVersions
		.map((cut, index) => ({ ["version" + index]: { ...cut, count: 1 } }))
		.reduce((acc, next) => ({ ...acc, ...next }))

	// We can't puchase part of a board, so the result but me an int, not a float.
	const ints = stockVersions
		.map((cut, index) => ({ ["version" + index]: 1 }))
		.reduce((acc, next) => ({ ...acc, ...next }))

	// Create constraints from the required cuts with a min on the count required.
	const constraints = requiredCuts
		.map(({ size, count }) => ({ ["cut" + size]: { min: count } }))
		.reduce((acc, next) => ({ ...acc, ...next }))

	// Create out model for the simplex linear programming solver.
	// https://github.com/JWally/jsLPSolver
	const model = {
		optimize: "count",
		opType: "min",
		variables: variables,
		int: ints,
		constraints: constraints,
	}

	// Run the program
	console.log("Model", util.inspect(model, { showHidden: false, depth: null }))
	const results = solver.Solve(model)
	console.log("Solution", results)

	if (!results.feasible) {
		throw new Error("Didn't work")
	}

	const resultCuts: ResultCuts = []

	console.log("You will need to buy", results.result, "boards.")
	for (let i = 0; i < waysOfCutting.length; i++) {
		const number = results["version" + i]
		if (number) {
			console.log(number, "will be cut to sizes", waysOfCutting[i])
			resultCuts.push({ count: number, cuts: waysOfCutting[i] })
		}
	}

	return resultCuts
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
	howToCutBoards1D(12 * 8, bedFrameBoard)
}

main()
