import { EngineInstance, tryParseJson } from "../SocketConnection/WebEngine";

// const chessboardParent = document.getElementById("chessboard");
function invertPieceCoord(coord) {
    let invCoord = { x: coord.x, y: 7 - coord.y};
    return invCoord; 
}
// Chess Game
class Chess {
	constructor(playerName, chessboardParent) {
		this.setDefault();
        this.chessboardParent = chessboardParent;
        this.playerName = playerName;
        this.currentPiece = null;
        const self = this;
        this.serverMessageCallback = (event) => {
            const data = event.data;
            const jsData = tryParseJson(data);
            if (jsData != null)
            {
                if (jsData.hasOwnProperty('value'))
                {
                    self.loadField(jsData);
                }
                else if (jsData.hasOwnProperty('spot'))
                {
                    console.log('available poses: ', jsData.available);
                    
                    let availablePoses = jsData.available;
                    if (self.info.isWhite)
                        availablePoses.forEach(function(coord, index) {
                            this[index] = invertPieceCoord(coord);
                        }, availablePoses);
                    if (self.currentPiece != null)
                        self.data.board.setSquarePossibilities(availablePoses, true);
                }
                // console.log('Data:', fieldData);
            }
            
        }
	}
    
	// set chess info as default
	setDefault() {
		this.info = {
			preview: false, // when previewing match history
			started: false, // when the started
			ended: false, // when the game is ended
			won: null, // Winning player
			turn: null, // Player turn
			timer: 5, // Five minutes Timer
            isWhite: false,
		};

		this.data = {
			players: [], // all the players
			matchHistory: [], // storing match history
			board: null, // board
		};

	}
    loadField(fieldData) {
        const field = fieldData.value;
        const isWhite = fieldData.isWhite;
        const enemyName = fieldData.enemyName;
        this.info.isWhite = isWhite;
        this.info.turn = null;
        const player1 = new Player({ username: this.playerName, id: 1, role: (isWhite ? "white": "black") }); // player 1
        const player2 = new Player({ username: enemyName, id: 2, role: (isWhite ? "black": "white") }); // player 2
        //clearing board from old stuff
        this.data.board.clearBoard();
        // then create board elements
        this.data.board.create();
        this.data.board.placePieces(field, isWhite);
        console.log(this.chessboardParent);
    }

    async init(callback) {
		// create new board
		this.data.board = new Board(this);
        //clearing board from old stuff
        this.data.board.clearBoard();
		// then create board elements
		this.data.board.create();

		callback && callback.call(this);
	}

	// assign players (player1,player2) 
    //TODO: use server
	async assignPlayers() {
		// will return a promise
		return new Promise((resolve) => {
			const player1 = new Player({ username: "Orlan", id: 1, role: "white" }); // player 1
			const player2 = new Player({ username: "Magnus", id: 2, role: "black" }); // player 2

			this.data.players = [player1, player2]; // assign into the game players

			// player 1 is first to move
			this.info.turn = player1;
			player1.info.isTurn = true;

			resolve(); // return
		});
	}


	notify() {
		const players = this.data.players;
		const ischecked = players[0].info.isChecked || players[1].info.isChecked;
		const checkedPlayer = this.checkedPlayer();
		ischecked && console.log(checkedPlayer.data.username + "  is checked");
	}

	// when their is a winner
	winner() {
		const Winner = this.info.won;
		const CreatePopUp = function () {};

		console.log(`The winner is ${Winner.data.username}`);

		CreatePopUp();
	}

	// end the game
	checkmate(player) {
		this.info.started = false;
		this.info.ended = true;
		this.info.won = player;

		console.log(`${this.info.turn.data.username} is Mate`);

		this.winner();
	}
}

class Board {
	constructor(game) {
		this.default = {
			col_row: 8, // col len
			col: ["a", "b", "c", "d", "e", "f", "g", "h"], // col literals
			row: [8, 7, 6, 5, 4, 3, 2, 1], // row literals
		};

		this.game = game; // the game
		this.data = []; // empty data values
	}
    create() {
		const col_row = this.default.col_row;
		const col = this.default.col;
		const row = this.default.row;

		let role = "white"; // start with white

		// change role
		const setRole = () => {
			return (role = role == "white" ? "black" : "white");
		};

		for (let r = 0; r < col_row; r++) {
			const squares = []; // store all the square
			for (let c = 0; c < col_row; c++) {
				const letter = col[c];
				const number = row[r];
				const position = `${letter}${number}`; // new position
				const boardPos = { y: r, x: c };
				const square = new Square(boardPos, position, setRole(), this.game); // new square

				squares.push(square); // push the square
			}

			this.data.push(squares) && setRole(); // push the squares in the board data
		}
	}
    clearBoard()
    {
        const chessBoard = this.game.chessboardParent;
        while (chessBoard.firstChild) {
            chessBoard.removeChild(chessBoard.lastChild);
        }
        this.data = []; 
    }
    placePieces(piecesData, isWhite)
    {
        const col_row = this.default.col_row;
        let id = 0;
        
        for (let r = 0; r < col_row; r++) {
			for (let c = 0; c < col_row; c++) {
                const curPieceData = piecesData[r][c];
                const type = curPieceData.type;
                if (type == null)
                    continue;
                
                let alias = '';
                const name = type.toUpperCase();
                const whitePiece = (type.toUpperCase() === type);
                if (type.toUpperCase() === type){
                    
                    alias = `w${type.toLowerCase()}`;
                }
                else
                    alias = `b${type}`;
                
                const boardCoord  = { y: curPieceData.y, x: curPieceData.x };
                let position = { y: curPieceData.y, x: curPieceData.x }; 
                if (isWhite)
                {
                    position = invertPieceCoord(position);
                }
                const id = r*8+c;
                const obj = { name: name, alias: alias, index: id, coord : boardCoord };
                    
                const piece = new Piece(obj, this.game); // new Piece
                // console.log(piece);
                let square = this.filterSquare(position); // select square acccording to its pos
			    let pieceElement = piece.info.element; // piece image
			    let squareElement = square.info.element; // and the square element
                piece.square = square; // declare square into piece
			    square.piece = piece; // declare piece into square

			    squareElement.appendChild(pieceElement); // just append the image to the square el
            }
        }
    }
    filterSquare(bp) {
		// check if it is already an object
		if (!bp) return null;
        
		// loop in board
		for (let squares of this.data) {
			// loop through the squares
			for (let square of squares) {
				// check if square the position is equal to the given pos
				if (square.info.boardPosition.x === bp.x && square.info.boardPosition.y === bp.y ) {
					return square;
				}
			}
		}
	}

    setSquarePossibilities(positions, insertUI)
    {
        if (!positions) return;
		// let { moves, enemies, castling } = possibilities;
		// reset first
		this.resetSquares();

		// then set square properties according to possibilities values
        console.log('setting position');
        positions.forEach((pos) => {
            // console.log('Set pos: ', pos);
            let square = this.filterSquare(pos);
            square.setAs("move", true, insertUI);
        })
		// moves.forEach((square) => square.setAs("move", true, insertUI));
		// enemies.forEach((square) => square.setAs("enemy", true, insertUI));
		// castling.forEach((square) => square.setAs("castling", true, insertUI));
    }

    resetSquares() {
        for (let squares of this.data) {
			for (let square of squares) {
				square.setAs("move", false, true);
				square.setAs("enemy", false, true);
				square.setAs("castling", false, true);
				square.setAs("from", false, true);
				square.setAs("to", false, true);
			}
		}
    }
}

class Piece {
	constructor(pieceObj, game) {
		this.info = {
			...pieceObj, // piece information
			fastpawn: pieceObj.name == "P", // only if pawn
			castling: pieceObj.name == "K", // only if king
			element: null,
		};

		this.data = {}; // just set to an empty * bug
		// this.player = player; // players
		this.game = game; // game

		this.init();
	}
    init() {
		this.create(); // create new Image element
		this.listener(); // some listeners
	}
    create() {
		const pieceElement = new Image(); // new Image element
		const classname = "chessboard-piece";

		// apply
		pieceElement.src = `/ChessAssets/pieces/${this.info.alias}.png`;
		pieceElement.classList.add(classname);

		this.info.element = pieceElement; // store
	}

    listener() {
        const piece = this; // selected piece
		const game = this.game; // the game
		const element = this.info.element; // the image of piece
		const board = game.data.board; // the board

		// on mousedown event
		const mousedown = function (event) {
			let current = null; // set as null a target square
			let elemBelow, droppableBelow; // squares positioning

			// if player is previewing match history
			// return false
			if (game.info.preview) return;

			// move the piece towards direction
			const move = function (pageX, pageY) {
				element.style.cursor = "grabbing"; // set the cursor as grab effect
				element.style.left = pageX - element.offsetWidth / 2 + "px";
				element.style.top = pageY - element.offsetHeight / 2 + "px";
			};

			// when user mousemove
			const mousemove = function (event) {
				move(event.pageX, event.pageY); // move the piece in mouse position

				element.hidden = true; // hide the element so it will not affect searching point
				elemBelow = document.elementFromPoint(event.clientX, event.clientY); // search from point x and y
				element.hidden = false; // then show again
                
				if (!elemBelow) return;
                
				// find the closest square from the mouse
				droppableBelow = elemBelow.closest(".chessboard-square");
                
                //console.log('dropBelow', droppableBelow);
                
				// if it is not the current square
				if (current != droppableBelow) current = droppableBelow;
			};

			// when the user drop the piece
			const drop = function () {
				// remove first the mousemove event
				document.removeEventListener("mousemove", mousemove);

				// then assign styles to go back to it's position in square
				element.removeAttribute("style");

                
				if (!current || game.info.turn != piece.player) 
                {
                    return false;
                }
				//piece.player.move(piece, current.getAttribute("data-position"));
                game.currentPiece = null;
                //board.resetSquares();
			};

			// just setting the styles
			const setStyle = function () {
				// set the position to absolute so the image can drag anywhere on the screen
				element.style.position = "absolute";
				// set the z index to max so it will go above all elements
				element.style.zIndex = 1000;
			};

			// just sets some listeners
			const manageListener = function () {
				// drop on mouseup event
				element.onmouseup = drop;

				// disabled dragging
				element.ondragstart = function () {
					return false;
				};

				// add mousemove listener again
				document.addEventListener("mousemove", mousemove);
			};

			// declaration
            board.resetSquares();
			setStyle();
			manageListener();
			move(event.pageX, event.pageY);

			if (game.info.turn != piece.player) return false;
			// get the piece possibilities, values(moves(array), enemies(array), castling(array))
			// then show circles to all that squares
			// board.setSquarePossibilities(piece, true);
            let coordToPlace = piece.info.coord;
            if (piece.game.info.isWhite)
                coordToPlace = invertPieceCoord(coordToPlace);
            
            console.log('coord: ', piece.info);
            EngineInstance.requestPossibleSquaresForPiece(piece.info.coord);

			game.currentPiece = piece;
		};

		// add mousedown listener
		element.addEventListener("mousedown", mousedown);
    }

}

class Square {
    constructor(boardPosition, position, role, game) {
		this.info = {
			boardPosition, // square board position
			position, // square position
			role, // square role
			element: null, // square element
			isMove: false, // possible move
			isEnemy: false, // possible enemy
			isCastle: false, // possible castle
		};

		this.piece = null; // the piece
		this.game = game; // the game

		this.init();
	}

	// initialize and ready
	init() {
		this.create(); // create square element
		this.listener(); // some listeners
	}

	// create ui
	create() {
		const squareElement = document.createElement("DIV"); // new Div element
		const classname = "chessboard-square"; // element classname

		squareElement.classList.add(classname); // add
		squareElement.setAttribute("role", this.info.role); // set role
		squareElement.setAttribute("data-position", this.info.position); // and pos
		this.game.chessboardParent.appendChild(squareElement); // append to parent
		this.info.element = squareElement; // store

	}

    listener(){}

    setAs(classname, bool, ui) {
		const element = this.info.element;

		this.info.isEnemy = classname == "enemy" && bool; // if there's enemy on the square
		this.info.isMove = classname == "move" && bool; // if can possibly move the piece
		this.info.isCastle = classname == "castling" && bool; // if can castling through that position

		if (!ui) return;
		// add class if true and remove if false
		bool
			? element.classList.add(classname)
			: element.classList.remove(classname);
	}
}

class Player {
    constructor(player)
    {
        this.info = {
			isTurn: false, // is player turn
			isWinner: false, // is already won
			isStarted: false, // is player started to move
			isTimeout: false, // is player time was ended
			isLeave: false, // is player was leaved
			isChecked: false, // is player was checked
			isReady: false, // is player is ready to go
		};

		this.data = {
			...player, // rewrite player information
			total_moves: 0, // all the moves
			timer: { m: null, s: null },
			piecesData: {}, // data pieces
			pieces: [], // array of pieces
			dropped: [], // all of the pieces that enemy slay
			eated: [], // eated pieces
			moves: [], // total possible moves
			enemies: [], // total possible enemies
			movesHistory: [], // player moves history
			currentPiece: null, // current Piece Holding,
			card: null,
		};

		this.game = null; // empty game
    }

}

export default Chess;