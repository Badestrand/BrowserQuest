import * as _ from 'underscore'
import * as React from 'react'
import {useState, useEffect, useRef} from 'react'

import {AllCharacterClasses} from '../../../shared/content'
import {getLevelFromExperience} from '../../../shared/gametypes'

import connection from '../connection'
import Game from '../game'
import Renderer from '../graphics/renderer'




function getSavedHeroAccess(): HeroAccessInfo|null {
	try {
		const {ident, secret} = JSON.parse(window.localStorage.hero)
		if (typeof ident!=='string' || typeof secret!=='string') {
			return null
		}
		return {ident, secret}
	}
	catch (err) {
		return null
	}
}

function deleteSavedHeroAccess() {
	window.localStorage.removeItem('hero')
}

function saveHeroAccess(data: HeroAccessInfo) {
	window.localStorage.hero = JSON.stringify(data)
}





function NewCharacterScreen({onPlay, onHelp}: any) {
	const inputRef = useRef<HTMLInputElement>()
	const [charClass, setCharClass] = useState<CharacterClassInfo>(AllCharacterClasses[0])
	const [name, setName] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus()
			}
		}, 50)
	}, [])

	const isValidName = name !== ''

	const onSubmit = async () => {
		if (isValidName && !loading) {
			setLoading(true)
			try {
				const hero = await connection.createPlayer(charClass.id, name)
				onPlay(hero)
				setLoading(false)
			}
			catch (err) {
				alert(err.message)
			}
		}
	}

	return (
		<article id="createcharacter">
			<h1>
				<span className="left-ornament"/>
				A Massively Multiplayer Adventure
				<span className="right-ornament"/>
			</h1>

			<div className="ribbon" onClick={onHelp}>
				<div className="top"/>
				<div className="bottom"/>
			</div>

			<ul className="charclasses">
				{AllCharacterClasses.map((cc) => (
				<li key={cc.id} className={(cc.isAvailable? '' : ' disabled')+(cc===charClass? ' selected' : '')} onClick={e => cc.isAvailable && setCharClass(cc)}>
					<div/>
					<p>
						{cc.name}
						{!cc.isAvailable && (<span><br/>(soon)</span>)}
					</p>
				</li>
				))}
			</ul>

			<form onSubmit={(event) => {event.preventDefault(); onSubmit(); return false}}>
				<input ref={inputRef} type="text" placeholder="Name your character" maxLength={15} value={name} onChange={e => setName(e.target.value)}/>
				<br/>
				<button type="submit" className={'play button'+(loading? ' loading' : '')} disabled={loading || !isValidName}>
					<div></div>
					{loading && (
					<img src="img/common/spinner.gif" alt=""/>
					)}
				</button>
			</form>
		</article>
	)
}




function LoadCharacterScreen({onPlay, onReset, onHelp, data}: any) {
	const loading = false
	const [img, setImg] = useState<string>(null)

	const onSubmit = (event) => {
		event.preventDefault()
		onPlay()
		return false
	}

	useEffect(() => {
		Renderer.getPlayerImage2(data.armorKind, data.weaponKind).then(setImg)
	}, [data.armor, data.weapon])

	return (
		<article id="loadcharacter">
			<h1>
				<span className="left-ornament"/>
				Load your character
				<span className="right-ornament"/>
			</h1>

			<div className="ribbon" onClick={onHelp}>
				<div className="top"/>
				<div className="bottom"/>
			</div>

			<img className="playerimage" src={img}/>
			<div className="playername stroke">
				{data.name} - {_.findWhere(AllCharacterClasses, {id: data.charClassId}).name} level {getLevelFromExperience(data.experience)}
			</div>

			<button type="button" className={'play button'+(loading? ' loading' : '')} onClick={onSubmit}>
				<div></div>
				{loading && (
				<img src="img/common/spinner.gif" alt=""/>
				)}
			</button>

			<div className="create-new">
				<span>or</span> <span className="text-link" onClick={onReset}>create a new character</span>
			</div>
		</article>
	)
}




function ResetCharacterScreen({onReset, onCancel}: any) {
	return (
		<article id="confirmation">
			<h1>
				<span className="left-ornament"/>
				Delete your character?
				<span className="right-ornament"/>
			</h1>

			<p>
				All your items and achievements will be lost.<br/>
				Are you sure you wish to continue?
			</p>

			<button type="button" className="delete button" onClick={onReset}/>

			<div>
				<span className="text-link" onClick={onCancel}>cancel</span>
			</div>
		</article>
	)
}




function AboutScreen({onClose}: any) {
	return (
		<article id="about">
			<h1>
				<span className="left-ornament"/>
				<span className="title">What is BrowserQuest?</span>
				<span className="right-ornament"/>
			</h1>

			<p id="game-desc">
				BrowserQuest is a multiplayer game inviting you to explore a world of adventure.<br/>
				<br/>
				It originated at <a href="https://github.com/mozilla/BrowserQuest" target="_blank">Mozilla</a> and is free to play, so dive right in!<br/>
				<br/>
				This version is developed and maintained by <a href="https://www.instagram.com/michelrichel/" target="_blank">Michel</a>.
			</p>

			<button type="button" className="button-red" onClick={onClose}>
				Close
			</button>
		</article>
	)
}




export default function IntroScreen({onStart}: {onStart: (hero: HeroInfo)=>void}) {
	const [loading, setLoading] = useState<boolean>(false)
	const [hero, setHero] = useState<HeroInfo>(null)
	const [mode, setMode] = useState<string>('create')
	const [next, setNext] = useState<string>(null)
	const [trans, setTrans] = useState<string>(null)


	const transitionTo = (newMode: string, nextMode: string=null) => {
		const TRANSITION_DURATION = 0.5

		setMode(null)
		setTrans('confirm')
		setNext(nextMode)

		setTimeout(() => {
			setMode(newMode)
			setTrans(null)
		}, TRANSITION_DURATION * 1000)
	}


	useEffect(() => {
		const heroAccess = getSavedHeroAccess()
		if (heroAccess) {
			setLoading(true)
			connection.previewPlayer(heroAccess.ident, heroAccess.secret)
				.then((hero) => {
					setHero(hero)
					setMode('load')
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}, [])


	return (
		<>
			<h1 id="logo">
				<span id="logosparks"/>
			</h1>

			<section id="parchment" className={trans? 'animate' : ''}>
				<div className="parchment-left"/>

				<div className="parchment-middle">
					{loading? (
						<p>Loading...</p>
					)
					: mode === 'create'? (
					<NewCharacterScreen
						onPlay={(newHero) => {
							saveHeroAccess({
								ident: newHero.ident,
								secret: newHero.secret
							})
							onStart(newHero)
						}}
						onHelp={() => transitionTo('about', 'create')}
					/>
					)
					: mode === 'load'? (
					<LoadCharacterScreen
						data={hero}
						onPlay={() => onStart(hero)}
						onReset={() => transitionTo('confirm')}
						onHelp={() => transitionTo('about', 'load')}
					/>
					)
					: mode === 'confirm'? (
					<ResetCharacterScreen
						onCancel={() => transitionTo('load')}
						onReset={() => {
							deleteSavedHeroAccess()
							setHero(null)
							transitionTo('create')
						}}
					/>
					)
					: mode === 'about'? (
					<AboutScreen
						onClose={() => transitionTo(next)}
					/>
					)
					: null}
				</div>

				<div className="parchment-right"/>
			</section>
		</>
	)
}