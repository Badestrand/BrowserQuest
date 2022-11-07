import * as fs from 'fs'
// import WebSocket from 'ws'
import * as path from 'path'
import * as _ from 'underscore'
import {fileURLToPath} from 'url'
import * as dotenv from 'dotenv'
import {JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer} from 'json-rpc-2.0'

import * as log from './log'
import Player from './player'
import WorldServer from './worldserver'
import * as ws from './ws'




function main(config) {
	const server = new ws.socketIOServer(config.host, config.port, config.clientUrl)
	const worlds: Array<WorldServer> = []
	let lastTotalPlayers = 0
	log.setLevel(config.debug_level)

	log.info("Starting BrowserQuest game server...");

	// {
	//  // raw websockets test, see https://masteringjs.io/tutorials/node/websockets
	// 	const server = new WebSocket.Server({port: 8006})
	// 	let sockets = []
	// 	server.on('connection', (socket) => {
	// 		sockets.push(socket)
	//
	// 		// When you receive a message, send that message to every socket.
	// 		socket.on('message', (msg) => {
	// 			sockets.forEach(s => s.send(msg))
	// 		})
	// 		// When a socket closes, or disconnects, remove it from the array.
	// 		socket.on('close', () => {
	// 			sockets = sockets.filter(s => s !== socket);
	// 		})
	// 	})
	// }


	server.onConnect((connection) => {
		const rpc = new JSONRPCServerAndClient(
			new JSONRPCServer(),
			new JSONRPCClient(async (request) => {
				try {
					connection._connection.emit('rpc', JSON.stringify(request))
				}
				catch (error) {
					// return new Promise.reject(error)
				}
			})
		)
		connection._connection.on('rpc', (message) => {
			rpc.receiveAndSend(JSON.parse(message))
		})

		rpc.addMethod('previewPlayer', ({ident, secret}: {ident: string, secret: string}) => {
			const heroInfo = Player.tryLoad(ident, secret)
			return heroInfo
		})

		rpc.addMethod('createPlayer', ({charClassId, name}: {charClassId: string, name: string}) => {
			const heroInfo = Player.create(charClassId, name)
			return heroInfo
		})

		rpc.addMethod('enter', ({ident, secret}: {ident: string, secret: string}) => {
			const heroInfo = Player.tryLoad(ident, secret)
			if (!heroInfo) {
				throw new Error('Invalid data')
			}

			// simply fill each world sequentially until they are full
			const world = _.detect(worlds, (world) => world.getPlayerCount() < config.nb_players_per_world)
			world.updatePopulation()

			const player = new Player(heroInfo, connection, world)
			log.info('Player '+ident+' entered with id '+player.id+'.')

			world.addPlayer(player)

			return {
				hero: heroInfo,
				id: player.id,
				x: player.x,
				y: player.y,
			}
		})
	})


	server.onError(function() {
		log.error(Array.prototype.join.call(arguments, ", "));
	});


	for (let i=0; i<config.nb_worlds; ++i) {
		const world = new WorldServer('world'+ (i+1), config.nb_players_per_world, server)
		world.run(config.map_filepath)
		worlds.push(world)
	}


	server.onRequestStatus(() => {
		JSON.stringify(getWorldDistribution(worlds))
	})


	// main game loop
	let time = new Date().getTime()
	setInterval(() => {
		const newTime = new Date().getTime()
		const deltaTime = newTime - time
		time = newTime

		for (const world of worlds) {
			world.tick(deltaTime / 1000)
		}
	}, 0)


	process.on('uncaughtException', function (e) {
		log.error('uncaughtException: ' + e);
	});
}




function getWorldDistribution(worlds) {
	var distribution = []

	_.each(worlds, function(world) {
		distribution.push(world.playerCount);
	});
	return distribution;
}




dotenv.config()

main({
	host: process.env.HOST,
	port: process.env.PORT,
	debug_level: process.env.DEBUG_LEVEL,
	nb_players_per_world: parseInt(process.env.NB_PLAYERS_PER_WORLD),
	nb_worlds: parseInt(process.env.NB_WORLDS),
	map_filepath: process.env.MAP_FILEPATH,
	metrics_enabled: process.env.METRICS_ENABLED === '1',
	clientUrl: process.env.CLIENT_URL,
	dataStoreFolder: process.env.DATA_STORE_FOLDER,
})




process
	.on('unhandledRejection', (reason, p) => {
		console.error(reason, 'Unhandled Rejection at Promise', p);
	})
	.on('uncaughtException', err => {
		console.error(err, 'Uncaught Exception thrown');
		process.exit(1);
	})
