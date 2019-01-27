import * as makeViewer from "@jscad/csg-viewer"
import { main } from "./model"

const viewerOptions = {
	background: [0.211, 0.2, 0.207, 1], // [1, 1, 1, 1],//54, 51, 53
	meshColor: [0.4, 0.6, 0.5, 1],
	grid: {
		display: true,
		color: [1, 1, 1, 0.1],
	},
	camera: {
		position: [450, 550, 700],
	},
	controls: {
		limits: {
			maxDistance: 1600,
			minDistance: 0.01,
		},
	},
}
// create viewer
const { csgViewer, viewerDefaults, viewerState$ } = makeViewer(
	document.body,
	viewerOptions
)

// and just run it, providing csg/cag data
const csg = main([])
csgViewer(viewerOptions, { solids: csg })

// and again, with different settings: it only overrides the given settings
// csgViewer({controls: {autoRotate: {enabled: true}}})
