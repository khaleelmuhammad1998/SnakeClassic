/* Variables for Document elements and supporting functions. */
const CanvasGame = document.getElementById("CanvasGame");
const Canvas2D = CanvasGame.getContext("2d");
const DivGameStateButtonPlay = document.getElementById("DivGameStateButtonPlay");
DivGameStateButtonPlay.addEventListener("click", () => {interpretInputGameState("DivGameStateButtonPlay")});
const DivGameStateButtonPause = document.getElementById("DivGameStateButtonPause");
DivGameStateButtonPause.addEventListener("click", () => {interpretInputGameState("DivGameStateButtonPause")});
const DivGameControlButtonLeft = document.getElementById("DivGameControlButtonLeft");
const DivGameControlButtonUp = document.getElementById("DivGameControlButtonUp");
const DivGameControlButtonRight = document.getElementById("DivGameControlButtonRight");
const DivGameControlButtonDown = document.getElementById("DivGameControlButtonDown");
const clampNumber = (num, min, max) => Math.min(Math.max(num, min), max);

/* Variables for Game. */
let GameState = null;
let GameUpdate = null;
const GameSpeed = 150;
const GameInputMouse = true;

/* Variables for Graphics. */
const RectSize = 10;
let ColorCanvasFill = "#d0e0d0";
let ColorCanvasStroke = "#a0b0a0";
let ColorTypefaceFill = "#607060";
let ColorPlayerFill = "#809080"
let ColorPlayerStroke = "#c0d0c0";
let ColorPlayerHead = "#607060";
let ColorCollectibleFill = "#607060";
let ColorCollectibleStroke = "#a0b0a0";

// Code for Player and Collectible.

/* Variables for Player and Collectible. */
let Player = [];
let PlayerDirection = null;
let PlayerHeadX = null
let PlayerHeadY = null
let PlayerHeadNew = null;
let PlayerScore = 0;
let Collectible = null;

/* Function to set the player's direction. */
function setPlayerDirection(value) {
    if (GameState == "GameStart" || GameState == "GameResume") {
        if (value == "PlayerDirectionLeft" && PlayerDirection != "PlayerDirectionRight") {
            PlayerDirection = "PlayerDirectionLeft";
        } else if (value == "PlayerDirectionUp" && PlayerDirection != "PlayerDirectionDown") {
            PlayerDirection = "PlayerDirectionUp";
        } else if (value == "PlayerDirectionRight" && PlayerDirection != "PlayerDirectionLeft") {
            PlayerDirection = "PlayerDirectionRight";
        } else if (value == "PlayerDirectionDown" && PlayerDirection != "PlayerDirectionUp") {
            PlayerDirection = "PlayerDirectionDown";
        }
    }
}

/* Function to check for player's self collision. */
function checkPlayerCollision(PlayerHead, PlayerArray) {
    for (let i = 0; i < PlayerArray.length; i++) {
        if (PlayerHead.x == PlayerArray[i].x && PlayerHead.y == PlayerArray[i].y) {
            return true;
        }
    }
    return false;
}

// Code for Input System.

/* Function to prevent arrow keys from scrolling on the page - Caret Browsing. */
function preventInputPageScrolling(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) { 
        event.preventDefault();
    }
}

/* Function to interpret the keyboard input. */
function interpretInputGameControl(event) {
    if (event.keyCode == 37) {
        setPlayerDirection("PlayerDirectionLeft");
    } else if (event.keyCode == 38) {
        setPlayerDirection("PlayerDirectionUp");
    } else if (event.keyCode == 39) {
        setPlayerDirection("PlayerDirectionRight");
    } else if (event.keyCode == 40) {
        setPlayerDirection("PlayerDirectionDown");
    }
}

/* Function to interpret the DivGameStateButtons input to alter the game's state accordingly. */
function interpretInputGameState(value) {
    if (value == "DivGameStateButtonPlay") {
        if (GameState == "GameInitialise") {
            changeGameState("GameStart");
        } else if (GameState == "GamePause") {
            changeGameState("GameResume");
        } else if (GameState == "GameStop") {
            changeGameState("GameReset");
        }
    } else if (value == "DivGameStateButtonPause") {        
        if (GameState == "GameStart" || GameState == "GameResume") {
            changeGameState("GamePause");
        } else if (GameState == "GamePause") {
            changeGameState("GameResume");
        }
    }
}

/* Function to enable and disable input based on game's state. */
function inputManager(value) {
    if (value == true) {
        window.addEventListener("keydown", preventInputPageScrolling);
        document.addEventListener("keydown", interpretInputGameControl);
        if (GameInputMouse == true) {
            DivGameControlButtonLeft.addEventListener("mousedown", () => {setPlayerDirection("PlayerDirectionLeft")});
            DivGameControlButtonUp.addEventListener("mousedown", () => {setPlayerDirection("PlayerDirectionUp")});
            DivGameControlButtonRight.addEventListener("mousedown", () => {setPlayerDirection("PlayerDirectionRight")});
            DivGameControlButtonDown.addEventListener("mousedown", () => {setPlayerDirection("PlayerDirectionDown")});
        }
    } else {
        window.removeEventListener("keydown", preventInputPageScrolling);
        document.removeEventListener("keydown", interpretInputGameControl);
        if (GameInputMouse == true) {
            DivGameControlButtonLeft.removeEventListener("mousedown", () => {});
            DivGameControlButtonUp.removeEventListener("mousedown", () => {});
            DivGameControlButtonRight.removeEventListener("mousedown", () => {});
            DivGameControlButtonDown.removeEventListener("mousedown", () => {});
        }
    }
}

// Code for Game Canvas.

/* Function to set the initial values of select variables to set the game's canvas. */
function initialiseGame() {
    PlayerScore = 0;
    Player.splice(0, Player.length);
    Player[0] = {
        x: ((CanvasGame.width / 2) - 30),
        y: (CanvasGame.height / 2)
    };
    PlayerDirection = null;
    PlayerHeadX = Player[0].x;
    PlayerHeadY = Player[0].y;
    PlayerHeadNew = {
        x: PlayerHeadX,
        y: PlayerHeadY
    };
    Collectible = {
        x: ((CanvasGame.width / 2) + 20),
        y: (CanvasGame.height / 2)
    };
}

/** Function to display the score and game's state on the canvas. */
function refreshUI() {
    Canvas2D.lineWidth = 3;
    Canvas2D.strokeStyle = ColorCanvasFill;
    Canvas2D.fillStyle = ColorTypefaceFill;
    Canvas2D.font = "20px Monospace";
    Canvas2D.strokeText(PlayerScore, 20, 30);
    Canvas2D.fillText(PlayerScore, 20, 30);
    Canvas2D.font = "14px Monospace";
    switch (GameState) {
        case "GameInitialise": {
            Canvas2D.strokeText("Press Play", 60, 160);
            Canvas2D.fillText("Press Play", 60, 160);
            break;
        }
        case "GamePause": {
            Canvas2D.strokeText("Paused", 75, 160);
            Canvas2D.fillText("Paused", 75, 160);
            break;
        }
        case "GameStop": {
            Canvas2D.strokeText("Game Over", 65, 160);
            Canvas2D.fillText("Game Over", 65, 160);
            break;
        }
    }
}

/* Game's Update Loop - This function is called repeatedly. */
function updateGame() {
    // Code to draw the game's canvas.
    Canvas2D.fillStyle = ColorCanvasFill;
    Canvas2D.fillRect(0, 0, CanvasGame.width, CanvasGame.height);
    Canvas2D.lineWidth = 5;
    Canvas2D.strokeStyle = ColorCanvasStroke;
    Canvas2D.strokeRect(2, 2, (CanvasGame.width - 5), (CanvasGame.height - 5));
    
    Canvas2D.lineWidth = 2;
    for (let i = 0; i < Player.length; i++) {
        Canvas2D.fillStyle = (i == 0) ? ColorPlayerHead : ColorPlayerFill;
        Canvas2D.fillRect(Player[i].x, Player[i].y, RectSize, RectSize);
        Canvas2D.strokeStyle = ColorPlayerStroke;
        Canvas2D.strokeRect(Player[i].x, Player[i].y, RectSize, RectSize);
    }
    Canvas2D.fillStyle = ColorCollectibleFill;
    Canvas2D.fillRect(Collectible.x, Collectible.y, RectSize, RectSize);
    Canvas2D.strokeStyle = ColorCollectibleStroke;
    Canvas2D.strokeRect(Collectible.x, Collectible.y, RectSize, RectSize);

    // Code to change player's direction.
    PlayerHeadX = Player[0].x;
    PlayerHeadY = Player[0].y;
    if (PlayerDirection == "PlayerDirectionLeft") {
        PlayerHeadX -= RectSize;
    }
    if (PlayerDirection == "PlayerDirectionUp") {
        PlayerHeadY -= RectSize;
    }
    if (PlayerDirection == "PlayerDirectionRight") {
        PlayerHeadX += RectSize;
    }
    if (PlayerDirection == "PlayerDirectionDown") {
        PlayerHeadY += RectSize;
    }

    // Code to check for player's collision with collectible and update player's array.
    if (PlayerHeadX == Collectible.x && PlayerHeadY == Collectible.y) {
        PlayerScore++;
        Collectible = {
            x: clampNumber((Math.floor(Math.random() * 20 + 1) * RectSize), 20, (CanvasGame.width - 20)),
            y: clampNumber((Math.floor(Math.random() * 20 + 1) * RectSize), 20, (CanvasGame.height - 20))
        };
    } else {
        Player.pop();
    }

    PlayerHeadNew = {
        x: PlayerHeadX,
        y: PlayerHeadY
    };

    // Code to check for player's collision with canvas borders or self. 
    if (PlayerHeadX < 0 || PlayerHeadX >= CanvasGame.width || PlayerHeadY < 0 || PlayerHeadY >= CanvasGame.height || checkPlayerCollision(PlayerHeadNew, Player)) {
        changeGameState("GameStop");
    }

    Player.unshift(PlayerHeadNew);

    // Code to refresh UI with updated score.
    refreshUI();
}

// Code to manage Game.

/* Function to set the game state. */
function changeGameState(value) {
    GameState = value;
    switch (value) {
        case "GameInitialise": {
            initialiseGame();
            updateGame();
            break;
        }
        case "GameStart": {
            inputManager(true);
            PlayerDirection = "PlayerDirectionRight";
            GameUpdate = setInterval(updateGame, GameSpeed);
            break;
        }
        case "GamePause": {
            clearInterval(GameUpdate);
            inputManager(false);
            refreshUI();
            break;
        }
        case "GameResume": {
            inputManager(true);
            GameUpdate = setInterval(updateGame, GameSpeed);
            break;
        }
        case "GameStop": {
            inputManager(false);
            clearInterval(GameUpdate);
            break;
        } case "GameReset": {
            changeGameState("GameInitialise");
            changeGameState("GameStart");
            break;
        }
    }
}

/* Main Function. */
function main() {
    changeGameState("GameInitialise");
}
main(); // The starting point of this program.