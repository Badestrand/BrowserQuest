import * as _ from 'underscore'
import EventEmitter from 'eventemitter3'
import * as React from 'react'
import {useState, useEffect, useRef, useReducer} from 'react'
import ReactDOM from 'react-dom/client'





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



export function showPopup(inner) {
	const div = document.createElement('div')
	div.classList.add('popup')
	document.body.appendChild(div)
	const root = ReactDOM.createRoot(div)
	root.render(inner)

	setTimeout(() => {
		div.classList.add('visible')
	}, 50)

	return {root, div}
}


export function closePopup({root, div}) {
	div.classList.remove('visible')
	setTimeout(() => {
		root.unmount()
		document.body.removeChild(div)
	}, 500)
}




export function Parchment({children, events, introduce}: any) {
	const [animating, setAnimating] = useState<boolean>(introduce)

	useEffect(() => {
		setTimeout(() => {
			setAnimating(false)
		}, 500)

		const onClose = () => {
			setAnimating(true)
		}
		events.on('close', onClose)
		return () => {
			events.removeListener('close', onClose)
		}
	}, [])

	return (
		<section id="parchment" className={animating? 'animate' : ''}>
			<div className="parchment-left"/>
			<div className="parchment-middle">
				{children}
			</div>
			<div className="parchment-right"/>
		</section>
	)
}


let parchmentMaster = new EventEmitter()
let parchmentPopup: any = null


export function showParchment(inner) {
	parchmentPopup = showPopup(<Parchment introduce={true} events={parchmentMaster}>{inner}</Parchment>)
}


export function hideParchment() {
	parchmentMaster.emit('close')
	closePopup(parchmentPopup)
	parchmentPopup = null
}


export function userAgentContains(string) {
	return navigator.userAgent.indexOf(string) != -1;
}


export function isTablet(screenWidth) {
	if(screenWidth > 640) {
		if((userAgentContains('Android') && userAgentContains('Firefox'))
		|| userAgentContains('Mobile')) {
			return true;
		}
	}
	return false;
}


export function isWindows() {
	return userAgentContains('Windows');
}


export function isChromeOnWindows() {
	return userAgentContains('Chrome') && userAgentContains('Windows');
}


export function canPlayMP3() {
	return true  //Modernizr.audio.mp3;
}


export function isSafari() {
	return userAgentContains('Safari') && !userAgentContains('Chrome');
}


export function isOpera() {
	return userAgentContains('Opera');
}
