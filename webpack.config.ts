import * as path from "path"
import * as HtmlWebpackPlugin from "html-webpack-plugin"
import { Configuration } from "webpack"

const config: Configuration = {
	mode: "development",
	entry: "./index.ts",
	resolve: {
		extensions: [".js", ".ts", ".tsx"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "awesome-typescript-loader",
					},
				],
			},
			{
				test: /\.(glsl|vs|fs|vert|frag)$/,
				exclude: /node_modules/,
				use: ["raw-loader", "glslify-loader"],
			},
		],
	},
	cache: true,
	devtool: "source-map", //false,
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].js",
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "index.html"),
		}),
	],
}

// Dev server configs aren't typed properly.
Object.assign(config, {
	devServer: {
		publicPath: "/",
		historyApiFallback: true,
	},
})

export default config
