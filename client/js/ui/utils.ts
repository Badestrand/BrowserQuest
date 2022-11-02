import * as React from 'react'
import {useEffect, useReducer} from 'react'
import EventEmitter from 'eventemitter3'




export function useForceUpdate() {
	const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
	return () => forceUpdate()
}



export function useWatchEvents(emitter: EventEmitter, eventName: string) {
	const forceUpdate = useForceUpdate()

	useEffect(() => {
		emitter.on(eventName, forceUpdate)
		return () => {
			emitter.off(eventName, forceUpdate)
		}
	}, [])
}
