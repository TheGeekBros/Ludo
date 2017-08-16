let Ludo = {
	context: document.querySelector('.game'),
	game: {
		playersCount: 0,
		board: '',
		pieces: [],
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
			unit: 640 / 15,
			boardStyle: 'simple-board',
			opponents: '1-1', // fix symmetry
		}
		Object.assign(this, settings, customSettings)
		this.resetBoard()
	},

	resetBoard() {
		this.context.innerHTML = ''
		this.game.board = Components.new(this.boardStyle)
		this.context.appendChild(this.game.board)

		let gamePieces = this.game.board.querySelector('.pieces')

		Array.from(gamePieces.children).forEach((piece) => {
			this.game.pieces.push(piece.cloneNode(false))
		})

		this.game.board.removeChild(this.game.board.querySelector('.pieces'))
		this.background = this.game.board.querySelector('.background')
		this.overlay = this.game.board.querySelector('.overlay')
		this.background.style.width = this.overlay.style.width =
			this.background.style.height = this.overlay.style.height = this.radius + 'px'

		let humanCount = Number(this.opponents[0]), cpuCount = Number(this.opponents[2])

		for (let p = 0; p < humanCount + cpuCount; p++) {
			let player = {isCpu: p < humanCount}
			this.game.players.push(player)
		}

		this.game.playersCount = humanCount + cpuCount
		console.assert(1 <= this.game.playersCount <= 4)

		for (let playerIndex = 0; playerIndex < this.game.playersCount; playerIndex++) {
			for (let pieceIndex = 0; pieceIndex < 4; pieceIndex++) {
				let piece = this.game.pieces[playerIndex].cloneNode(false)
				let x = this.game.defaultPositions.home[playerIndex].x
				let y = this.game.defaultPositions.home[playerIndex].y
				let pieceOffsetX = this.game.defaultPositions.homeOffset[pieceIndex][0]
				let pieceOffsetY = this.game.defaultPositions.homeOffset[pieceIndex][1]
				piece.style.position = 'absolute'
				piece.style.left = (x - pieceOffsetX) * this.unit + 'px'
				piece.style.top = (y - pieceOffsetY) * this.unit + 'px'
				this.overlay.appendChild(piece)
			}
		}

		this.overlay.querySelectorAll('.piece').forEach((element) => {
			element.style.height = element.style.width = this.unit + 'px'
		})
	},
}