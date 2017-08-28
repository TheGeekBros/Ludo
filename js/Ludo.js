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
				{x: 6, y: 13}, {x: 8, y: 1}, {x: 13, y: 8}, {x: 1, y: 6}
			],
			diceCenter: [],
			slotBackground: [
				{x: 0, y: 9}, {x: 9, y: 0}, {x: 9, y: 9}, {x: 0, y: 0}
			]
		},
		turns: [],
		onField: []
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
		console.assert(1 <= this.game.playersCount && this.game.playersCount <= 4)

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
						playerIndex: playerIndex,
						pieceIndex: pieceIndex,
						location: {
							x: x - pieceOffsetX,
							y: y - pieceOffsetY
						},
						firstStep: this.game.defaultPositions.firstCell[playerIndex],
						unit: this.unit,
						shrinked: false,
						view: this.game.pieceTemplates[playerIndex].cloneNode(false)
					})
				this.overlay.appendChild(piece.view)
				this.game.pieces.push(piece)
			}
			this.game.onField.push(false)
		}

		this.game.block = this.context.querySelector('.block')
		Common.setCSS(this.game.block, {
			position: 'absolute',
			width: this.unit * 6,
			height: this.unit * 6,
			opacity: 0
		})
		anime({
			targets: this.game.block,
			opacity: 0.3,
			direction: 'alternate',
			loop: -1,
			elasticity: 500,
			duration: 500
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

		Common.setCSS(this.game.dice, {
			left: this.game.defaultPositions.diceCenter,
			top : this.game.defaultPositions.diceCenter
		})

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
		if (0 <= playerIndex && playerIndex <= 3) {
			let location = this.game.defaultPositions.slotBackground[playerIndex]
			let src = Common.getAttribute(this.game.block, (playerIndex + 1) + '-src')
			this.game.block.setAttribute('src', src)
			Common.setCSS(this.game.block, {
				display: 'block',
				top: location.y * this.unit,
				left: location.x * this.unit
			})
		} else {
			Common.setCSS(this.game.block, {
				display: 'none'
			})
		}
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
		this.defaultLocation = profile.location
		this.firstStep = profile.firstStep
		this.reflectView()
		this.createPath()
	}

	createPath() {
		this.path = [this.defaultLocation, this.firstStep]
		this.pathPointer = 0
		let stepLoopArray = [4, 1, 5, 2, 5, 1, 5, 2, 5, 1, 5, 2, 5, 1, 5, 1, 6]
		let xSteps = [0, -1, -1, 0, 1, 1, 0, 1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 0]
		let ySteps = [-1, -1, 0, -1, 0, -1, -1, 0, 1, 1, 0, 1, 0, 1, 1, 0, -1]
		switch (this.playerIndex) {
			case 1:
				xSteps = xSteps.map((x) => (x * -1))
				ySteps = ySteps.map((y) => (y * -1))
				break
			case 2:
				[xSteps, ySteps] = [ySteps, xSteps.map((x) => (x * -1))]
				break
			case 3:
				[xSteps, ySteps] = [ySteps.map((y) => (y * -1)), xSteps]
				break
		}
		for (let i = 0; i < stepLoopArray.length; i++) {
			for (let j = 0; j < stepLoopArray[i]; j++) {
				this.path.push({
					x: this.previousStep.x + xSteps[i],
					y: this.previousStep.y + ySteps[i]
				})
			}
		}
	}

	get previousStep() {
		return this.path[this.path.length - 1]
	}

	walkTo(from, to) {
		if (from < to) {
			to = to > 57 ? 57 : to
			from = from < 0 ? 0 : from
		} else {
			from = from > 57 ? 57 : from
			to = to < 0 ? 0 : to
		}

		let steps = to - from
		let walkTimeline = anime.timeline()

		if (steps > 0) {
			for (let y = from + 1; y <= to; y++) {
				walkTimeline.add({
					targets: this.view,
					left: this.path[y].x * this.unit,
					top: this.path[y].y * this.unit,
					duration: 100,
					easing: 'linear'
				})
			}
		} else {
			for (let y = from - 1; y >= to; y--) {
				walkTimeline.add({
					targets: this.view,
					left: this.path[y].x * this.unit,
					top: this.path[y].y * this.unit,
					duration: 50,
					easing: 'linear'
				})
			}
		}
	}

	step(n) {
		this.walkTo(this.pathPointer, this.pathPointer + n)
		this.pathPointer += n
		if (this.pathPointer < 0) {
			this.pathPointer = 0
		}
		if (this.pathPointer > 57) {
			this.pathPointer = 57
		}
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