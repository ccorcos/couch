const { color } = require("@jscad/csg/api").color
const { cube, sphere, cylinder } = require("@jscad/csg/api").primitives3d
const { square, circle } = require("@jscad/csg/api").primitives2d
const { linear_extrude } = require("@jscad/csg/api").extrusions
const { union, difference } = require("@jscad/csg/api").booleanOps
const { translate } = require("@jscad/csg/api").transformations

//then use the functions above
export const main = parameters => {
	return [
		union(cube(), sphere({ r: 10 })),
		difference(sphere(), color([1, 0, 0], cylinder())),
	]
}

export const getParameterDefinitions = () => {
	return []
}
