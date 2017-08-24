let Ludo = {
	context: document.querySelector('.game'),
	game: {
		playersCount: 0,
		board: '',
		pieces: [],
		pieceTemplates: [],
		piecesCorner: [],
		players: [],
		defaultPositions: {
			home: [
				{x: 2.5, y: 11.5},  // blue (1)
				{x: 11.5, y: 2.5},  // green (2)
				{x: 11.5, y: 11.5}, // yellow (3)
				{x: 2.5, y: 2.5},   // red (4)
			],
			homeOffset: [
				[-1, -1], [-1, 1], [1, -1], [1, 1]
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
		this.resetBoard()
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
		this.background = this.game.board.querySelector('.background')
		this.overlay = this.game.board.querySelector('.overlay')
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
				let x = this.game.defaultPositions.home[playerIndex].x,
					y = this.game.defaultPositions.home[playerIndex].y,
					pieceOffsetX = this.game.defaultPositions.homeOffset[pieceIndex][0],
					pieceOffsetY = this.game.defaultPositions.homeOffset[pieceIndex][1],
					piece = new Piece({
						id: (playerIndex + 1) + '-' + (pieceIndex + 1),
						location: {
							x: x - pieceOffsetX,
							y: y - pieceOffsetY
						},
						unit: this.unit,
						shrinked: false,
						html: this.game.pieceTemplates[playerIndex].cloneNode(false)
					})
				this.overlay.appendChild(piece.html)
				this.game.pieces.push(piece)
			}
		}
	},
}

class Piece {
	constructor(profile) {
		Object.assign(this, profile)
		this.html.style.position = 'absolute'
		this.view = {
			normal: this.html.getAttribute('data-src'),
			shrinked: this.html.getAttribute('data-shrinked-src')
		}
		this.html.style.left = (profile.location.x * this.unit) + 'px'
		this.html.style.top = (profile.location.y * this.unit) + 'px'
		this.html.style.height = this.html.style.width = this.unit + 'px'
		this.reflectView()
	}

	moveTo(location) {
		this.reflectView()
		this.location = location
		anime({
			targets: this.html,
			left: this.location.x * this.unit,
			top: this.location.y * this.unit
		})
	}

	reflectView() {
		this.html.setAttribute('src', this.shrinked ? this.view.shrinked : this.view.normal)
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