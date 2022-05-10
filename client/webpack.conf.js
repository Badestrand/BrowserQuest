const path = require('path')



module.exports = {
	entry: './js/main.js',
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env']
				}
			}
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
		extensions: ['.tsx', '.ts', '.js', '.json'],
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
