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
				{x: 2.5, y: 11.5},  // blue (1)
				{x: 11.5, y: 2.5},  // green (2)
				{x: 11.5, y: 11.5}, // yellow (3)
				{x: 2.5, y: 2.5},   // red (4)
			],
			slotCenterOffset: [
				[-1, -1], [-1, 1], [1, -1], [1, 1]
			],
			firstCell: [
				{x: 7, y: 14},
				{x: 9, y: 2},
				{x: 14, y: 9},
				{x: 2, y: 7},
			],
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
		this.resetBoard()
		this.setupDice()
	},

	resetBoard() {
		this.context.innerHTML = ''
		this.game.board = Common.newComponent(this.boardStyle)
		this.context.appendChild(this.game.board)

		let gamePieces = this.game.board.querySelector('.pieces')

		Array.from(gamePieces.children).forEach((piece) => {
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

	},

	setupDice() {
		this.game.dice = this.game.board.querySelector('.dice')
		this.overlay.appendChild(this.game.dice)
		this.game.dice.style.position = 'absolute'
		this.game.dice.style.height = this.game.dice.style.width = this.diceRadius + 'px'
		this.game.dice.style.left = this.game.dice.style.top = (this.unit * 7.5) - this.diceRadius / 2 + 'px'
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

		this.game.dice.style.left = this.game.dice.style.top = (this.unit * 7.5) - this.diceRadius / 2 + 'px'

		let diceAnim = anime.timeline()

		let signA = this.random6() % 2 === 0 ? '-' : '+'
		let signB = this.random6() % 2 === 0 ? '-' : '+'

		for(let frames = 0; frames < 7; frames++) {
			diceAnim.add({
				targets: this.game.dice,
				rotate: "+=" + this.random6() * 10,
				duration: 10 + frames * 10,
				complete: frames < 6 ? changeFace : endFace,
				scale: 0.4 + (frames * 0.1),
				left: signA + '=' + (Math.random() * 5),
				top : signB + '=' + (Math.random() * 5),
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
	}
}

class Piece {
	constructor(profile) {
		Object.assign(this, profile)
		this.view.style.position = 'absolute'
		this.state = {
			normal: this.view.getAttribute('data-src'),
			shrinked: this.view.getAttribute('data-shrinked-src')
		}
		this.view.style.left = (this.location.x * this.unit) + 'px'
		this.view.style.top = (this.location.y * this.unit) + 'px'
		this.view.style.height = this.view.style.width = this.unit + 'px'
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
		this.view.setAttribute('src', this.shrinked ? this.state.shrinked : this.state.normal)
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