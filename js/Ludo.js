let Ludo = {
	context: document.querySelector('.game'),
	radius: 640, // px
	unit: this.radius / 12,
	boardStyle: 'simple-board',
	game: {playersCount: 2, board: 'not-set'},

	init() {
		this.resetBoard()
	},

	addPieces(playersCount) {

	},

	resetBoard() {
		this.context.innerHTML = ''
		this.game.board = getComponent(this.boardStyle)
		this.context.appendChild()
		for (let p = 0; p < this.game.playersCount; p++) {

		}
	},

	defaultPosition(areaName) {
		switch (areaName) {
			case 'center':
				return {x: this.radius / 2, y: this.radius / 2}
		}
	},
}