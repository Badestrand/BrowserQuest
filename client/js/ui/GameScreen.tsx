import * as React from 'react'
import {useState, useEffect, useRef} from 'react'

import ActionBar from './ActionBar'
import Game from '../game'
import {showParchment, hideParchment} from './misc'




function DeathInfo({onRevive}: any) {
	return (
		<article id="death">
			<p>You are dead...</p>
			<button type="button" id="respawn" className="button" onClick={onRevive}/>
		</article>
	)
}


function DisconnectInfo({message, onReload}: any) {
	return (
		<article id="disconnected">
			<p>{message}</p>
			<button type="button" className="button-red" onClick={onReload}>Reload</button>
		</article>
	)
}




export default function GameScreen({hero}: {hero: HeroInfo}) {
	const [game, setGame] = useState<Game>(null)


	useEffect(() => {
		const newGame = new Game(
			'#bubbles',
			document.getElementById("entities"),
			document.getElementById("background"),
			document.getElementById("foreground")
		)

		newGame.readyPromise.then(() => {
			newGame.enter(hero).then(() => {
				setGame(newGame)
			})
		})

		newGame.onPlayerDeath(() => {
			showParchment(<DeathInfo onRevive={() => {
				newGame.audioManager.playSound("revive")
				newGame.restart(hero)
				hideParchment()
			}}/>)
		})

		newGame.onDisconnect((message) => {
			showParchment(<DisconnectInfo message={message} onReload={() => {
				window.location.reload()
			}}/>)
		})

		const setMouseCoordinates = (event) => {
			const gamePos = document.getElementById('foreground').getBoundingClientRect()
			const scale = newGame.renderer.getScaleFactor()
			const width = newGame.renderer.getWidth()
			const height = newGame.renderer.getHeight()
			const x = event.pageX - gamePos.left - (newGame.renderer.mobile ? 0 : 5 * scale)
			const y = event.pageY - gamePos.top - (newGame.renderer.mobile ? 0 : 7 * scale)
			newGame.mouse.x = Math.max(0, Math.min(width-1, x))
			newGame.mouse.y = Math.max(0, Math.min(height-1, y))
			newGame.moveCursor()
		}
		const onMouseEnter = (event) => {
			newGame.showCursor()
		}
		const onMouseLeave = (event) => {
			newGame.hideCursor()
		}
		const onMouseMove = (event) => {
			setMouseCoordinates(event)
		}
		const onTouchStart = (event) => {
			setMouseCoordinates(event.originalEvent.touches[0])
			newGame.click()
		}
		const onClick = (event) => {
			setMouseCoordinates(event)
			newGame.click()
		}

		const canvas = document.getElementById('foreground')
		canvas.addEventListener('mouseenter', onMouseEnter)
		canvas.addEventListener('mouseleave', onMouseLeave)
		canvas.addEventListener('mousemove', onMouseMove)
		canvas.addEventListener('touchstart', onTouchStart)
		canvas.addEventListener('click', onClick)

		return () => {
			canvas.removeEventListener('mouseenter', onMouseEnter)
			canvas.removeEventListener('mouseleave', onMouseLeave)
			canvas.removeEventListener('mousemove', onMouseMove)
			canvas.removeEventListener('touchstart', onTouchStart)
			canvas.removeEventListener('click', onClick)
		}
	}, [])


	return (
		<div id="container">
			<div id="canvasborder">
				<div id="canvas">
					<canvas id="background"/>
					<canvas id="entities"/>
					<canvas id="foreground"></canvas>
				</div>

				<div id="bubbles"></div>

				{Boolean(game) && (
				<ActionBar game={game}/>
				)}
			</div>
		</div>
	)
}