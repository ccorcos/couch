import { CSG } from "@jscad/csg"

interface CSG {
	cube(opts?: { size?: [number, number, number] })
}

const { cube } = CSG

//then use the functions above
export const main = parameters => {
	return [cube()]
	// return [
	// 	union(cube(), sphere({ r: 10 })),
	// 	difference(sphere(), color([1, 0, 0], cylinder())),
	// ]
}

export const getParameterDefinitions = () => {
	return []
}
