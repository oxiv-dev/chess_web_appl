import { EngineInstance, tryParseJson } from "../SocketConnection/WebEngine";

// const chessboardParent = document.getElementById("chessboard");

function isFieldDataSame(data1, data2) {
    return (JSON.stringify(data1) === JSON.stringify(data2)); 
}
// Chess Game
class Chess {
	constructor(playerName, chessboardParent) {
		this.setDefault();
        this.chessboardParent = chessboardParent;
        this.playerName = playerName;
        this.currentPiece = null;
        this.mateCallback = null;        
        this.checkCallback = null;     
        this.prevFieldData = null;   
        const self = this;
        this.serverMessageCallback = (event) => {
            const data = event.data;
            const jsData = tryParseJson(data);
            
            if (jsData != null)
            {
                if (jsData.hasOwnProperty('value'))
                {
                    if(!isFieldDataSame(self.prevFieldData, jsData)) {
                        const playerCard = document.querySelector(`.player-card.player-${1}`);
                        const username = playerCard.querySelector(".row-1 .text .headline h4");
                        username.innerText = self.playerName;
                        const enemyCard = document.querySelector(`.player-card.player-${2}`);
                        const enemyname = enemyCard.querySelector(".row-1 .text .headline h4");
                        enemyname.innerText = jsData.enemy;

                        self.loadField(jsData);
                        self.prevFieldData = jsData;
                    }
                }
                else if (jsData.hasOwnProperty('spot'))
                {
                    
                    let availablePoses = jsData.available;
                    let boardCoordsToSet = [];
                        availablePoses.forEach(function(coord, index) {
                            boardCoordsToSet.push(self.data.board.getBoardCoord(coord));
                            //this[index] = invertPieceCoord(coord);
                        }, availablePoses);
                    if (self.currentPiece != null)
                        self.data.board.setSquarePossibilities(boardCoordsToSet, true);
                }
                else if (jsData.hasOwnProperty('type'))
                {
                    const isCheckToPlayer = (gameCoord) => {
                        const boardCoord = self.data.board.getBoardCoord(gameCoord);
                        const square = self.data.board.filterSquare(boardCoord);
                        const piece = square.piece;
                        const isWhite = (piece.info.alias.charAt(0) === "w");
                        const isToPlayer = (this.info.isWhite === isWhite);
                        return isToPlayer;
                    };
                    if (jsData.type === "check")
                    {
                        const gameCoord = jsData.square;
                        const isToPlayer = isCheckToPlayer(gameCoord);
                        // console.log(jsData);
                        // console.log(piece.info.alias.charAt(0));
                        self.checkCallback(isToPlayer);
                    }
                    else if (jsData.type === "checkmate")
                    {
                        const gameCoord = jsData.square;
                        const isToPlayer = isCheckToPlayer(gameCoord);
                        self.mateCallback(isToPlayer);
                    }
                }
                
            }
            
        }
	}
    onCheck(callback) {
        this.checkCallback = callback;   
    }
    onCheckMate(callback) {
        this.mateCallback = callback;        
        
    }
    placePiece(piece, where) {
        const board = this.data.board;
        const oldCoord = piece.info.coord;
        const gameCoord = JSON.parse(where);
        const boardCoord = board.getBoardCoord(gameCoord);
        const square = board.filterSquare(boardCoord);
        const info = square.info;
        const isQualified = info.isMove || info.isEnemy || info.isCastle;

        if (isQualified)
        {
            //console.log(piece)
            piece.move(square, info.isCastle);   
            const mes = `{"from":{"x": ${oldCoord.x},"y": ${oldCoord.y}},"to":{"x": ${gameCoord.x},"y": ${gameCoord.y}}}`;
            EngineInstance.sendMessageSafe(mes)
        }
        // console.log('Square: ', square);
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
        
        this.players = [ player1, player2];
        //clearing board from old stuff
        this.data.board.clearBoard();
        // then create board elements
        this.data.board.create();
        this.data.board.placePieces(field, isWhite);
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

}

class Board {
	constructor(game) {
		this.default = {
			col_row: 8, // col len
			col: ["a", "b", "c", "d", "e", "f", "g", "h"], // col literals
			row: [8, 7, 6, 5, 4, 3, 2, 1], // row literals
		};

		this.game = game; // the game
        this.isWhite = game.info.isWhite;
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
				const boardPos = { y: r, x: c };
				const position = JSON.stringify(this.getGameCoord(boardPos));// `${letter}${number}`; // new position
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
    getBoardCoord(gameCoord) {
        let boardPos = { x: gameCoord.x, y: gameCoord.y};
        if (this.game.info.isWhite)
            boardPos.y = 7 - boardPos.y;
        else
            boardPos.x = 7 - boardPos.x;
        return boardPos;
    }
    getGameCoord(boardCoord) {
        let gamePos = { x: boardCoord.x, y: boardCoord.y};
        if (this.game.info.isWhite)
            gamePos.y = 7 - gamePos.y;
        else
            gamePos.x = 7 - gamePos.x;
        return gamePos;
    }
    placePieces(piecesData, isWhite)
    {
        const col_row = this.default.col_row;
        let id = 0;
        const self = this;
        const game = this.game;
        piecesData.forEach((curPieceData) => {
            const type = curPieceData.type;
                if (type == null)
                    return;
                
                let alias = '';
                const name = type.toUpperCase();
                const whitePiece = (type.toUpperCase() === type);
                if (type.toUpperCase() === type){
                    
                    alias = `w${type.toLowerCase()}`;
                }
                else
                    alias = `b${type}`;
                
                const gameCoord  = { y: curPieceData.y, x: curPieceData.x };
                const position = self.getBoardCoord(gameCoord);
                const mId = id++;
                const obj = { name: name, alias: alias, index: mId, coord : gameCoord };
                    
                const piece = new Piece(obj, this.game); // new Piece
                // console.log(piece);
                let square = this.filterSquare(position); // select square acccording to its pos
			    let pieceElement = piece.info.element; // piece image
			    let squareElement = square.info.element; // and the square element
                piece.square = square; // declare square into piece
			    square.piece = piece; // declare piece into square

                let player = null;
                if ((game.players[0].role == "white" && isWhite) || (game.players[0].role == "black" && !isWhite))
                    player = game.players[0];
                else
                    player = game.players[1];

			    squareElement.appendChild(pieceElement); // just append the image to the square el
        })
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
    move(square, isCastling) {
        let old = this.square;
		// eat piece inside
		this.eat(square.piece);
		// move piece into the square
		this.silentMove(square);
		// move the image into the square element
		this.moveElementTo(square);

		// trigger, finished moved
		//this.game.moved(old, square);

		// if the move is castling, then castle
		isCastling && this.castling();
    }
    eat(piece) {
		if (!piece) return;

		// if element exist, remove the element
		piece.info.element && piece.info.element.remove();

		// insert into the target player dropped pieces
		// piecePlayer.data.dropped.push(piece);
		// // remove piece into the target player pieces
		// piecePlayer.data.pieces.splice(piecePlayer.data.pieces.indexOf(piece), 1);
		// // insert into the player eated pieces
		// player.data.eated.push(piece);

		return piece;
	}
    moveElementTo(square) {
		// set fastpawn and castling to false
		this.info.fastpawn = false;
		this.info.castling = false;

		// append the element into the target square element
		square.info.element.appendChild(this.info.element);
	}
    silentMove(square) {
		const piece = this;
		const board = this.game.data.board;

		// make sure it is Square object
		//square = board.filterSquare(square);

		// set first to false
		square.piece = false;
		piece.square.piece = false;

		// change data
		square.piece = piece;
		piece.square = square;
		piece.info.position = square.info.position;
        piece.info.coord = board.getGameCoord(square.info.position);
		piece.square.piece = piece;
	}
    castling() {
		// castling only if it is king
		if (this.info.name != "K") return false;

		// const game = this.game;
		// const board = game.data.board.data;
		// const { x, y } = this.square.info.boardPosition;

		// const check = function (piece, square, condition) {
		// 	// move only if the condition is true
		// 	if (!condition) return;

		// 	// move piece into the square
		// 	piece.silentMove(square);
		// 	// move element into the square element
		// 	piece.moveElementTo(square);
		// };

		// // right and left rook
		// const rr = board[y][x + 1].piece;
		// const lr = board[y][x - 2].piece;

		// // check each rook
		// check(rr, board[y][x - 1], rr && rr.info.name == "Rook");
		// check(lr, board[y][x + 1], lr && lr.info.name == "Rook");
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
				game.placePiece(piece, current.getAttribute("data-position"));
                board.resetSquares();

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