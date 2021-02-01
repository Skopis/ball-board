var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.png" />';

var gBoard;
var gGamerPos;
var gUserScore = 0;
var gBallCount = 0;
var gGameInterval;
var gGlueInterval;
var gTimeOut;
var gOnGlue = false;
var victoryStatus = false;

function initGame() {
	victoryStatus = false;
	var elVictoryModal = document.querySelector(".victory")
	elVictoryModal.style.display = "none"
	var elScore = document.querySelector(".score");
	elScore.innerText = '0';
	gBallCount = 0;
	gUserScore = 0;
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
}

function checkIfVictory() {
	if (gUserScore === gBallCount && gUserScore >= 2) {
		clearInterval(gGameInterval)
		gGameInterval = null;
		clearInterval(gGlueInterval);
		gGlueInterval = null;
		var elVictoryModal = document.querySelector(".victory")
		elVictoryModal.style.display = "block";
		victoryStatus = true;
	}
	return false;
}

function buildBoard() {
	var board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			if ((i === 0 && j === board.length / 2) || (i === board.length - 1 && j === board[0].length / 2 - 1) || (i === board.length / 2)) cell.type = FLOOR;
			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// Place the Balls (currently randomly chosen positions)
	gGameInterval = setInterval(addBalls, 3000);
	gGlueInterval = setInterval(addGlue, 5000);
	console.log(board);
	return board;
}

function addGlue() {
	var i = getRandomInt(1, gBoard.length - 1);
	var j = getRandomInt(1, gBoard[0].length - 1);
	if (gBoard[i][j].gameElement !== BALL && gBoard[i][j].gameElement !== GAMER) {
		gBoard[i][j].gameElement = GLUE;
		renderBoard(gBoard);
		setTimeout(function () {
			if (gBoard[i][j].gameElement === GAMER) return;
			gBoard[i][j].gameElement = FLOOR;
			renderBoard(gBoard);
		}, 3000);
	}
}

function addBalls() {
	var i = getRandomInt(1, gBoard.length - 1);
	var j = getRandomInt(1, gBoard[0].length - 1);
	if (gBoard[i][j].gameElement !== BALL && gBoard[i][j].gameElement !== GAMER) {
		gBoard[i][j].gameElement = BALL;
		gBallCount++;
		renderBoard(gBoard);
	}
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var cellClass = getClassName({ i: i, j: j })
			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';
			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';
			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			} else if (currCell.gameElement === GLUE) {
				strHTML += GLUE_IMG;
			}
			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (victoryStatus) return;
	if (gOnGlue) return;
	if (i === -1) i = gBoard.length - 1;
	if (j === -1) j = gBoard[0].length - 1;
	if (i === gBoard.length) i = 0;
	if (j === gBoard[0].length) j = 0;
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;
	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);
	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === gBoard.length - 1) || (iAbsDiff === gBoard[0].length - 1 && jAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === gBoard[0].length - 1)) {
		if (targetCell.gameElement === BALL) {
			var audio = new Audio('js/coin.mp3');
			audio.play();
			gUserScore++;
			checkIfVictory();
			var elScore = document.querySelector('.score');
			elScore.innerHTML = gUserScore;
		}
		//if Target element is GLUE
		if (targetCell.gameElement === GLUE) {
			gOnGlue = true;
			setTimeout(function () {
				gOnGlue = false;
			}, 3000);
		}
		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');
		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}
}