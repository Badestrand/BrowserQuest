import * as React from 'react'
import {useState, useEffect, useRef} from 'react'
import ReactDOM from 'react-dom/client'

import GameScreen from './ui/GameScreen'
import IntroScreen from './ui/IntroScreen'

import '../css/main.less'




function Everything() {
	const [hero, setHero] = useState<HeroInfo>(null)

	return (
		<div>
			{hero===null? (
				<IntroScreen onStart={setHero}/>
			) : (
				<GameScreen hero={hero}/>
			)}
		</div>
	)
}




const container = document.createElement('div')
document.body.appendChild(container)
const root = ReactDOM.createRoot(container)
root.render(<Everything/>)
