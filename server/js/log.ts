const levelGrades = {
	debug: 1,
	info: 2,
	error: 3,
}

let globalLevel = 'debug'



function log(level, ...params) {
	if (levelGrades[level] >= levelGrades[globalLevel]) {
		console.log(...params)
	}
}



export function debug(...params) {
	log('debug', ...params)
}

export function info(...params) {
	log('info', ...params)
}

export function error(...params) {
	log('error', ...params)
}



export function setLevel(level) {
	globalLevel = level
}
