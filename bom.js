const fs = require("fs-extra")
const _ = require("lodash")
const solver = require("javascript-lp-solver/src/solver")
const util = require("util")

function howManyWays(size, cuts, state = []) {
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

async function main() {
	const logs = await fs.readFile("./logs.txt", "utf8")

	const lines = logs.split("\n").filter(line => line.indexOf("BOM:") !== -1)

	// Regex to match groups based on the echo BOM format.
	// "BOM: <NAME> (OPTIONAL LABEL)", <VALUE>
	const matches = lines.map(line =>
		/BOM: ([^\(" ]+) ?(\([^\)]+\))?", (.*)/.exec(line)
	)

	const parsed = matches.map(([match, name, label, size]) => {
		label = label ? label.slice(1, -1) : undefined
		size = size.split(",").map(x => parseFloat(x.trim()))
		size = size.length === 1 ? size[0] : size
		return { name, label, size }
	})

	const groups = _.groupBy(parsed, item => item.name)

	// Given n boards of length 96
	// and cuts
	// - 17x at 76
	// - 7x at 80
	// - 21x at 7
	// how many boards do I need?
	// how do I cut them?
	const stockSize = 12 * 96
	// how many ways can you cut a 96 inch board into 7, 76, and 80 inch pieces?

	console.log(howManyWays(96, [7, 76, 80]))

	// [ { size: 7, count: 21 },
	// 	{ size: 76, count: 17 },
	// 	{ size: 80, count: 7 } ]
	const sizes = _.values(
		_.groupBy(groups.bed_frame_board, item => item.size)
	).map(arr => ({ size: arr[0].size, count: arr.length }))

	// Use this to get the number of boards we need.
	const model = {
		optimize: "count",
		opType: "min",
		variables: {
			version1: {
				count: 1,
				cut7: 2,
				cut76: 1,
				cut80: 0,
			},
			version2: {
				count: 1,
				cut7: 2,
				cut76: 0,
				cut80: 1,
			},
			version3: {
				count: 1,
				cut7: 13,
				cut76: 0,
				cut80: 0,
			},
		},
		// All counts must be integers
		int: {
			version1: 1,
			version2: 1,
			version3: 1,
		},
		constraints: {
			// Number of boards of each size we need.
			cut7: { min: 21 },
			cut76: { min: 17 },
			cut80: { min: 7 },
		},
	}

	// // Now that we know we need 21 boards, create independent variables for each board.
	// const boardVariables = Array(21)
	// 	.fill(0)
	// 	.map((ignore, i) => ({
	// 		["board96_" + i]: {
	// 			["count96_" + i]: 1,
	// 			length: 96,
	// 		},
	// 	}))
	// 	.reduce((acc, item) => ({ ...acc, ...item }))

	// // We can't have more than one of each board, but we know we'll need all of them.
	// const boardConstraints = Array(21)
	// 	.fill(0)
	// 	.map((ignore, i) => ({
	// 		["count96_" + i]: { max: 1 },
	// 	}))
	// 	.reduce((acc, item) => ({ ...acc, ...item }))

	// const boardInts = Array(21)
	// 	.fill(0)
	// 	.map((ignore, i) => ({
	// 		["board96_" + i]: 1,
	// 	}))
	// 	.reduce((acc, item) => ({ ...acc, ...item }))

	// // Combine the models maximizing the left over length.
	// const model = {
	// 	optimize: "length",
	// 	opType: "max",
	// 	variables: {
	// 		...boardVariables,
	// 		// These are the cuts, with negative length
	// 		board7: {
	// 			count7: 1,
	// 			length: -7,
	// 		},
	// 		board76: {
	// 			count76: 1,
	// 			length: -76,
	// 		},
	// 		board80: {
	// 			count80: 1,
	// 			length: -80,
	// 		},
	// 	},
	// 	// All counts must be integers
	// 	int: {
	// 		...boardInts,
	// 		board7: 1,
	// 		board76: 1,
	// 		board80: 1,
	// 	},
	// 	constraints: {
	// 		...boardConstraints,
	// 		// Number of boards of each size we need.
	// 		count7: { min: 21 },
	// 		count76: { min: 17 },
	// 		count80: { min: 7 },
	// 		// We should have some wood left over.
	// 		length: { min: 0 },
	// 	},
	// }

	const results = solver.Solve(model)

	console.log(util.inspect(model, { showHidden: false, depth: null }))
	console.log(results)
	// console.log(util.inspect(solver, { showHidden: false, depth: null }))
}

main()
