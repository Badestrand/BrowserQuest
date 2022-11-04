import {io} from 'socket.io-client'
import {JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer} from 'json-rpc-2.0'

import config from './config'




class Server {
	constructor(host: string, port: number) {
		// this._ws = new WebSocket('ws://'+host+':'+port)
		this._conn = io('http://'+host+':'+port+'/')
		this._rpc = null
		this._connected = false
		this._err = null

		this._connPromise = new Promise((resolve, reject) => {
			this._conn.on('connect', (socket) => {
			// this._ws.onopen = () => {
				this._connected = true
				console.log('connected!')

				this._rpc = new JSONRPCServerAndClient(
					new JSONRPCServer(),
					new JSONRPCClient(async (request) => {
						try {
							console.log('sending', JSON.stringify(request))
							this._conn.emit('rpc', JSON.stringify(request))
							// this._ws.send(JSON.stringify(request))
							// return new Promise.resolve()
						}
						catch (error) {
							// return new Promise.reject(error)
						}
					})
				)
				// this._ws.onmessage = (event) => {
				// 	this._rpc.receiveAndSend(JSON.parse(event.data.toString()));
				// }
				resolve()
			})
		})

		this._conn.on('disconnect', () => {
			console.log('Server.DISCONNECT')
			// does it automatically try to reconnect?
			// this._connected = false
			// this._conn = null
		})

		this._conn.on('err', (err: Error) => {
			console.log('Server.ERR', err)
			// this._connected = false
			// this._err = err
			// this._conn = null
		})

		this._conn.on('rpc', (message) => {
			console.log('received', message)
			this._rpc.receiveAndSend(JSON.parse(message))
		})
	}


	async connect(): Promise<void> {
		if (this._err) {
			throw this._err
		}
		if (this._connected) {
			return
		}
		return this._connPromise
	}


	isConnected(): boolean {
		return this._connected
	}


	error(): Error {
		return this._err
	}


	connection(): any {
		return this._conn
	}


	async previewPlayer(ident: string, secret: string): Promise<HeroInfo> {
		await this._connPromise
		if (this._err) {
			throw this._err
		}
		if (!this._connected) {
			throw new Error('Not connected to server')
		}

		return await this._rpc.request('previewPlayer', {ident, secret})
	}


	async createPlayer(charClassId: string, name: string): Promise<HeroInfo> {
		await this._connPromise
		return await this._rpc.request('createPlayer', {charClassId, name})
	}


	async enter({ident, secret}: {ident: string, secret: string}): Promise<{hero: HeroInfo, id: number, x: number, y: number}> {
		await this._connPromise
		return await this._rpc.request('enter', {ident, secret})
	}


	private _conn: any
	// private _ws: WebSocket
	private _rpc: any
	private _err: Error
	private _connected: boolean
	private _connPromise: Promise<void>
	private _pendingRequests: {[reqId: string]: any}
}



const server = new Server(config.host, config.port)
export default server
