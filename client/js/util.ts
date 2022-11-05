import {useState, useEffect, useRef, useReducer} from 'react'



// Function.prototype.bind = function (bind) {
//     var self = this;
//     return function () {
//         var args = Array.prototype.slice.call(arguments);
//         return self.apply(bind || null, args);
//     };
// };

export function isInt(n) {
	return (n % 1) === 0;
}

export var TRANSITIONEND = 'transitionend webkitTransitionEnd oTransitionEnd'

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
const wnd = window as any
wnd.requestAnimFrame = (function(){
	return wnd.requestAnimationFrame    || 
		wnd.webkitRequestAnimationFrame || 
		wnd.mozRequestAnimationFrame    || 
		wnd.oRequestAnimationFrame      || 
		wnd.msRequestAnimationFrame     || 
		function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		}
})()


export function clone<T>(o: T): T {
	return JSON.parse(JSON.stringify(o))
}



export function sleep(ms: number) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms)
	})
}


export function useForceUpdate() {
	const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
	return () => forceUpdate()
}