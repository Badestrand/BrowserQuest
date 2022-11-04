import url from 'url'
import * as _ from 'underscore'
import express from 'express'
import * as socket from 'socket.io'
import xhttp from 'http'

import * as log from './log'
import * as Utils from './utils'




class Server {
	constructor(port) {
		this.port = port;
		this._connections = {}
		this._counter = 0
	}

	onConnect(callback) {
		this.connection_callback = callback;
	}

	onError(callback) {
		this.error_callback = callback;
	}

	broadcast(message) {
		throw "Not implemented";
	}

	forEachConnection(callback) {
		_.each(this._connections, callback);
	}

	addConnection(connection) {
		this._connections[connection.id] = connection;
	}

	removeConnection(id) {
		delete this._connections[id];
	}

	getConnection(id) {
		return this._connections[id];
	}

	connectionsCount() {
		return Object.keys(this._connections).length
	}


	public port: any
	public _connections: any
	public _counter: any
	public connection_callback: any
	public error_callback: any
}




class Connection {
	constructor(id, connection, server) {
		this._connection = connection;
		this._server = server;
		this.id = id;
	}
	
	onClose(callback) {
		this.close_callback = callback;
	}
	
	listen(callback) {
		this.listen_callback = callback;
	}
	
	broadcast(message) {
		throw "Not implemented";
	}
	
	send(message) {
		throw "Not implemented";
	}
	
	sendUTF8(data) {
		throw "Not implemented";
	}
	
	close(logError) {
		log.info("Closing connection to "+this._connection.remoteAddress+". Error: "+logError);
		this._connection.close();
	}


	public id: any
	public _connection: any
	public _server: any
	public close_callback: any
	public listen_callback: any
}




export class socketIOServer extends Server {
	constructor(host, port, clientUrl) {
		super(undefined)
		this.host = host
		this.port = port
		const app = express()
		const http = xhttp.createServer(app)
		this.io = new socket.Server(http, {
			cors: {
				origin: clientUrl
			}
		})

		this.io.on('connection', (connection) => {
			log.info('a user connected')

			connection.remoteAddress = connection.handshake.address.address

			var c = new socketIOConnection(this._createId(), connection, this)
			
			if(this.connection_callback) {
				this.connection_callback(c)
			}
			this.addConnection(c)
		})

		this.io.on('error', (err) => {
			log.error(err.stack)
			this.error_callback()
		})

		http.listen(port, () => {
			log.info('listening on *:' + port)
		});
	}

	_createId() {
		return '5' + Utils.random(99) + '' + (this._counter++)
	}
	
	broadcast(message) {
		this.io.emit("message", message)
	}

	onRequestStatus(status_callback) {
		this.status_callback = status_callback;
	}


	public host: any
	public io: any
	public status_callback: any
}



export class socketIOConnection extends Connection {
	constructor(id, connection, server) {
		super(id, connection, server);
		var self = this
		// HANDLE DISPATCHER IN HERE
		connection.on("dispatch", function (message) {
			console.log("Received dispatch request")
			self._connection.emit("dispatched",  {
				status: "OK",
				host: server.host,
				port: server.port
			})
		})

		connection.on("message", function (message) {
			log.info("Received: " + message)
			if (self.listen_callback)
				self.listen_callback(message)
		});

		connection.on("disconnect", function () {
			if(self.close_callback) {
				self.close_callback();
			}
			self._server.removeConnection(self.id);
		})
	}
	
	broadcast(message) {
		throw "Not implemented";
	}
	
	send(message) {
		console.log('Sending:', message)
		this._connection.emit("message", message);
	}
	
	sendUTF8(data) {
		this.send(data)
	}

	close(logError) {
		log.info("Closing connection to socket"+". Error: " + logError);
		this._connection.disconnect();
	}
}
