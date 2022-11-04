import * as React from 'react'
import {useState, useEffect} from 'react'
import * as EventEmitter from 'eventemitter3'

import {useWatchEvents} from './utils'
import Game from '../game'
import Player from '../player'




export default function CharacterScreen({game, player, onClose}: {game: Game, player: Player, onClose: ()=>void}) {
	useWatchEvents(player, 'update')

	const [visible, setVisible] = useState(false)

	useEffect(() => {
		setTimeout(() => {
			setVisible(true)
		}, 20)
	}, [])

	const unspentPoints = player.getUnspentAttrPoints()
	return (
		<div id="character-screen" className={visible? 'visible' : ''}>
			<button className="close-screen" type="button" onClick={(event) => onClose()}>X</button>
			<h1>Character</h1>

			<div className="overview">
				<p className="level-class">Level {player.getLevel()} {player.getClassName()}</p>
				<p className="name">{player.getName()}</p>
				{player.getLevel() < Player.getMaxLevel() && (
				<>
					<div className="experience-bar">
						<div style={{width: player.getExperienceProgressForThisLevel()*100+'%'}}/>
					</div>
					{unspentPoints>0 && (
					<p className="points-remaining">
						{unspentPoints} attribute points remaining.
					</p>
					)}
					<p className="experience-progress">{player.getTotalExperience()} of {player.getNextExperienceRequirement()} experience for level {player.getLevel()+1}</p>
				</>
				)}
			</div>

			<div className="main-details">
				<div className="attributes">
					{[['Strength', 'str'], ['Agility', 'dex'], ['Vitality', 'vit'], ['Energy', 'ene']].map(attr => (
					<div key={attr[1]}>
						<div className="primary">
							<span>
								<span>{attr[0]}</span>
								<span>{player.getTotalAttrPoints(attr[1] as "str" | "dex" | "vit" | "ene")}</span>
							</span>
							{unspentPoints>0 && (
							<button type="button" onClick={() => {
								player.spendAttrPoint(attr[1] as AttrShort)
							}}>
								+
							</button>
							)}
						</div>
						<div className="secondary">
							{attr[1]==='str' && (
							<>
								<div>
									<span>Attack damage</span>
									<span>{player.getAttackDamage()}</span>
								</div>
							</>
							)}
							{attr[1]==='dex' && (
							<>
								<div>
									<span>Attack rating</span>
									<span>{Math.round(player.getAttackRating())}</span>
								</div>
								<div>
									<span>Defense rating</span>
									<span>{Math.round(player.getDefenseRating())}</span>
								</div>
							</>
							)}
							{attr[1]==='vit' && (
							<>
								<div>
									<span>Life</span>
									<span>{player.getCurHitpoints()} / {player.getMaxHitpoints()}</span>
								</div>
							</>
							)}
							{attr[1]==='ene' && (
							<>
								<div>
									<span>Mana</span>
									<span>{player.getCurMana()} / {player.getMaxMana()}</span>
								</div>
							</>
							)}
						</div>
					</div>
					))}
				</div>

				<div className="equipment">
					<div className="title">Equipment buffs</div>
					{[['Fire', 'fir'], ['Ice', 'ice'], ['Lighting', 'lig'], ['Poison', 'psn']].map((res) => (
					<div key={res[1]} className="entry">
						<p className="label">{res[0]} resistance</p>
						<p className="value">{Math.round(player.getResistance(res[1] as "fir" | "ice" | "lig" | "psn") * 100)} %</p>
					</div>
					))}
				</div>
			</div>
		</div>
	)
}
