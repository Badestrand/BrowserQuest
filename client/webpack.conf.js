const path = require('path')
const JsxPlugin = require('@babel/plugin-syntax-jsx')



module.exports = {
	entry: './js/main.tsx',
	module: {
		rules: [{
			test: /\.(jsx|js|ts|tsx)$/,
			use: 'ts-loader',
			exclude: /node_modules/,
			// test: /\.(jsx|js)$/,
			// exclude: /node_modules/,
			// use: {
			// 	loader: 'babel-loader',
			// 	options: {
			// 		presets: [
			// 			'@babel/preset-env',
			// 			'@babel/preset-react'
			// 		]
			// 	}
			// }
		}, {
			test: /\.less/,
			use: [
				{
					loader: 'file-loader',
					options: {
						name: '[name].css'
					}
				},
				{
					loader: 'extract-loader'
				},
				{
					loader: 'css-loader',
					//options: {
					//	minimize: true
					//}
				},
				{
					loader: 'less-loader'
				}
			]
		}, {
			test: /\.css/,
			use: [{
				loader: 'file-loader',
				options: {
					name: '[name].css',
					esModule: false,
				}
			}, {
				loader: 'extract-loader',
				options: {
					esModule: false,
				}
			}, {
				loader: 'css-loader',
			}]
		}, {
			test: /\.txt$/i,
			use: 'raw-loader',
		}],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', 'jsx', '.json'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, '../client-build'),
	},

	mode: 'development',
	devtool: 'eval-source-map',

	devServer: {
		static: {
			directory: path.join(__dirname, '.'),
		},
		hot: true,
		port: 8002,
	},
}
