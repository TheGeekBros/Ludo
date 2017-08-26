let Ludo = {
	context: document.querySelector('.game'),
	game: {
		playersCount: 0,
		board: '',
		pieces: [],
		pieceTemplates: [],
		piecesCorner: [],
		players: [],
		dice: '',
		diceLock: true,
		defaultPositions: {
			slotCenter: [
				// b g y r
				{x: 2.5, y: 11.5}, {x: 11.5, y: 2.5}, {x: 11.5, y: 11.5}, {x: 2.5, y: 2.5}
			],
			slotCenterOffset: [
				[-1, -1], [-1, 1], [1, -1], [1, 1]
			],
			firstCell: [
				{x: 7, y: 14}, {x: 9, y: 2}, {x: 14, y: 9}, {x: 2, y: 7}
			],
			diceCenter: [],
			slotBackground: [
				{x: 0, y: 9}, {x: 9, y: 0}, {x: 9, y: 9}, {x: 0, y: 0}
			]
		}
	},

	init(customSettings) {
		let settings = {
			radius: 640,
			boardStyle: 'classic',
			gameMode: '1-1', // TODO: When game is set to 1-2, order should be CPU-HUMAN-CPU (YELLOW-BLUE-RED)
		}
		Object.assign(this, settings, customSettings)
		this.unit = this.radius / 15
		this.diceRadius = this.unit * 1.5
		this.game.defaultPositions.diceCenter = (this.unit * 7.5) - (this.diceRadius / 2)
		this.resetBoard()
		this.setupDice()
	},

	resetBoard() {
		this.context.innerHTML = ''
		this.game.board = this.context.appendChild(Common.newComponent(this.boardStyle))

		Array.from(this.game.board.querySelector('.pieces').children).forEach((piece) => {
			this.game.pieceTemplates.push(piece.cloneNode(false))
		})

		this.game.board.removeChild(this.game.board.querySelector('.pieces'))
		this.overlay = this.game.board.querySelector('.overlay')
		this.background = this.game.board.querySelector('.background')
		this.background.style.width = this.overlay.style.width =
			this.background.style.height = this.overlay.style.height = this.radius + 'px'

		let humanCount = Number(this.gameMode[0]), cpuCount = Number(this.gameMode[2])

		this.game.playersCount = humanCount + cpuCount
		console.assert(1 <= this.game.playersCount <= 4)

		for (let p = 0; p < humanCount + cpuCount; p++) {
			this.game.players.push({isCpu: p < humanCount})
		}

		for (let playerIndex = 0; playerIndex < this.game.playersCount; playerIndex++) {
			for (let pieceIndex = 0; pieceIndex < 4; pieceIndex++) {
				let x = this.game.defaultPositions.slotCenter[playerIndex].x,
					y = this.game.defaultPositions.slotCenter[playerIndex].y,
					pieceOffsetX = this.game.defaultPositions.slotCenterOffset[pieceIndex][0],
					pieceOffsetY = this.game.defaultPositions.slotCenterOffset[pieceIndex][1],
					piece = new Piece({
						id: (playerIndex + 1) + '-' + (pieceIndex + 1),
						location: {
							x: x - pieceOffsetX,
							y: y - pieceOffsetY
						},
						unit: this.unit,
						shrinked: false,
						view: this.game.pieceTemplates[playerIndex].cloneNode(false)
					})
				this.overlay.appendChild(piece.view)
				this.game.pieces.push(piece)
			}
		}

		this.game.block = this.game.board.appendChild(this.context.querySelector('.block'))
		Common.setCSS(this.game.block, {
			position: 'absolute',
			width: this.unit * 6,
			height: this.unit * 6,
			zIndex: -1
		})
	},

	setupDice() {
		this.game.dice = this.overlay.appendChild(this.game.board.querySelector('.dice'))
		Common.setCSS(this.game.dice, {
			position: 'absolute',
			height: this.diceRadius,
			width: this.diceRadius,
			left: this.game.defaultPositions.diceCenter,
			top: this.game.defaultPositions.diceCenter,
		})
		this.game.dice.setAttribute('src', Common.getAttribute(this.game.dice, 'face-6-src'))
		this.game.dice.addEventListener('click', this.rollDice.bind(this, null, null))
	},

	random6(){
		return 1 + Math.round(Math.random() * 5)
	},

	rollDice(callback, roll) {
		callback = callback || function () {
				console.log("callback called")
			}

		roll = roll || this.random6()

		this.game.dice.style.left = this.game.dice.style.top = this.game.defaultPositions.diceCenter + 'px'

		let diceAnim = anime.timeline()

		let signA = this.random6() % 2 === 0 ? '-' : '+'
		let signB = this.random6() % 2 === 0 ? '-' : '+'

		for (let keyFrames = 0; keyFrames < 7; keyFrames++) {
			diceAnim.add({
				targets: this.game.dice,
				rotate: "+=" + this.random6() * 10,
				duration: 10 + keyFrames * 10,
				complete: keyFrames < 6 ? changeFace : endFace,
				scale: 0.4 + (keyFrames * 0.1),
				left: signA + '=' + (Math.random() * 5),
				top: signB + '=' + (Math.random() * 5),
			})
		}

		function changeFace(anim) {
			let faceAttr = 'face-' + (1 + Math.round(Math.random() * 5)) + '-src'
			let target = anim.animatables[0].target
			target.setAttribute('src', Common.getAttribute(target, faceAttr))
		}

		function endFace(anim) {
			let faceAttr = 'face-' + roll + '-src'
			let target = anim.animatables[0].target
			target.setAttribute('src', Common.getAttribute(target, faceAttr))
		}
	},
	indicateTurn (playerIndex) {
		let location = this.game.defaultPositions.slotBackground[playerIndex]
		let src = Common.getAttribute(this.game.block, (playerIndex + 1) + '-src')
		this.game.block.setAttribute('src', src)
		Common.setCSS(this.game.block, {
			top: location.y * this.unit,
			left: location.x * this.unit
		})
	},
	play() {

	}
}

class Piece {
	constructor(profile) {
		Object.assign(this, profile)
		this.size = {
			normal: Common.getAttribute(this.view, 'src'),
			shrinked: Common.getAttribute(this.view, 'shrinked-src')
		}
		Common.setCSS(this.view, {
			position: 'absolute',
			left: this.location.x * this.unit,
			top: this.location.y * this.unit,
			height: this.unit,
			width: this.unit
		})
		this.reflectView()
	}

	moveTo(location) {
		this.reflectView()
		this.location = location
		anime({
			targets: this.view,
			left: this.location.x * this.unit,
			top: this.location.y * this.unit
		})
	}

	reflectView() {
		this.view.setAttribute('src', this.shrinked ? this.size.shrinked : this.size.normal)
	}

	shrink() {
		this.shrinked = true
		this.reflectView()
	}

	normal() {
		this.shrinked = false
		this.reflectView()
	}
}