// Define
let ROWS = 10;
let COLS = 10;
let SHIPS = [];
const UNDEFINED = 0;
const SEA = 1;
const SHIP = 2;
const NEAR = "near";
const BONUS = 100;

const SHIP_BOARD_RATIO = 0.3;
const SHIP_NUMBER_LIMIT = 8;


class Board{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.data2D = []; // 0-undefined, 1-sea, 2-ships, near
        this.CreateEmptyBoard();
    }
    CreateEmptyBoard(){
        for (let row = 0; row < this.rows; row++) {
            let rowData = [];
            for (let col = 0; col < this.cols; col++) {
                rowData.push(0);
            }
            this.data2D.push(rowData);
        }
    }
    ClearBoard(){
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.data2D[row][col] = 0;
            }
        }
    }
    AutoPlaceShips(ships){
        // console.log("Auto place ships START");
        this.ClearBoard();
        let shipsLeftToPlace = [...ships];
        shipsLeftToPlace.sort(function(a, b) {
            return a-b;
        });
        // console.log(shipsLeftToPlace)
        while (shipsLeftToPlace.length > 0) {
            let length = shipsLeftToPlace[shipsLeftToPlace.length-1];
            // console.log(`Length ${length}`)
            while (true) {
                let randRow = RandomIntFromInterval(0, this.rows-1);
                let randCol = RandomIntFromInterval(0, this.cols-1);
                let validChecks = 0;
                if(this.data2D[randRow][randCol] != 0){
                    //console.log(`Cell ${randCol}-${randRow} is not possible`);
                    continue;
                }
                validChecks += 1;
                // Randomly choose direction
                let randDir = RandomIntFromInterval(0,3);
                let dRow = 0;
                let dCol = 0;
                switch (randDir) {
                    case 0: // Up
                        dRow = -1;
                        break;

                    case 1: // Right
                        dCol = 1;
                        break;

                    case 2: // Down
                        dRow = -1;
                        break;
                        
                    case 3: // Left
                        dCol = -1;
                        break;
                        
                    default:
                        console.log("Default randDir")
                        break;
                }
                for (let i = 1; i < length; i++) {
                    if(this.IsInBoard(randRow+dRow*i, randCol+dCol*i) &&
                       this.data2D[randRow+dRow*i][randCol+dCol*i] == 0){
                        validChecks += 1;
                    }
                }
                // Place if valid
                if(validChecks != length) continue;
                this.data2D[randRow][randCol] = SHIP;
                for (let i = 1; i < length; i++) {
                    this.data2D[randRow+dRow*i][randCol+dCol*i] = SHIP;
                    
                }
                shipsLeftToPlace.pop();
                // Set near cells
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        if(this.data2D[row][col] == UNDEFINED || this.data2D[row][col] == NEAR) continue;
                        const dRow = [-1, -1, 0, 1, 1, 1, 0, -1];
                        const dCol = [0, 1, 1, 1, 0, -1, -1, -1];
                        for (let i = 0; i < 8; i++) {
                            if(this.IsInBoard(row+dRow[i], col+dCol[i]) &&
                            this.data2D[row+dRow[i]][col+dCol[i]] == 0){
                                this.data2D[row+dRow[i]][col+dCol[i]] = NEAR;
                            }
                            
                        }
                    }
                }
                // console.log(`Placed ${length} ${ships}`)
                break;
            }
        }
        // Remove near cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if(this.data2D[row][col] != SHIP){
                    this.data2D[row][col] = SEA;
                }
            }
        }
        // console.log("Autp place ships END");
    }
    GiveFeedback(row, col){
        // hit 1, missed 0
        // console.log(`r:${row} c:${col}`)
        let result = 0;
        if(this.data2D[row][col] == UNDEFINED) {result = 0;}
        else if(this.data2D[row][col] == SHIP) {result = 1;}
        //console.log(`Row:${row} Col:${col} Res:${result}`)
        return result;
    }
    
    IsInBoard(row, col){
        if(row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
        return true;
    }
    ChangeRowsCols(rows,cols){
        this.rows = rows;
        this.cols = cols;
        this.data2D = [];
        this.CreateEmptyBoard();
    }
}

//#region PLAYERS
class Player{
    constructor(name, ships, rows, cols){
        this.name = name;
        this.description = "";
        this.ships = ships;
        this.rows = rows;
        this.cols = cols;
        this.board = new Board(this.rows, this.cols);
        this.moves = 0;
    }
    GetMove(){}
    LogMoveResult(row, col, result){
        this.moves += 1;
        if(result == 0) this.board.data2D[row][col] = SEA;
        else {
            this.board.data2D[row][col] = SHIP;
        }
    }
    Reset(){
        this.moves = 0;
    }
    IsFinished(){
        let shipsHit = 0;
        let allShips = 0;
        for(let length of this.ships){
            allShips += length;
        }
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                if(this.board.data2D[row][col] == SHIP){
                    shipsHit += 1;
                }
            }
        }
        if(shipsHit == allShips) return true;
        return false;
    }
    ChangeRowsCols(rows,cols){
        this.rows = rows;
        this.cols = cols;
        this.board = new Board(this.rows, this.cols);
        Reset();
    }
    ChangeShips(ships){
        this.ships = ships;
        Reset();
    }
}

class Bot1 extends Player{
    // random shooting
    constructor(name, ships, rows, cols){
        super(name, ships, rows, cols);
        this.description = "Randomly shot spot in board";
        this.unshotSpots = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.unshotSpots.push([row,col]);
            }
        }
    }
    GetMove(){
        // const randRow = RandomIntFromInterval(0, this.rows-1);
        // const randCol = RandomIntFromInterval(0, this.cols-1);
        // const spot = [randRow, randCol];

        let randIndex = RandomIntFromInterval(0, this.unshotSpots.length-1);
        let randSpot = this.unshotSpots[randIndex];
        this.unshotSpots.splice(randIndex,1);

        return randSpot;
    }
    // LogMoveResult(row, col, result){
    //     if(result == 0) this.board.data2D[row][col] = 1;
    //     else this.board.data2D[row][col] = 5;
    // }
    Reset(){
        super.Reset();
        this.board.ClearBoard();
        this.unshotSpots = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.unshotSpots.push([row,col]);
            }
        }
    }
}
class Bot2 extends Player{
    // random shooting
    constructor(name, ships, rows, cols){
        super(name, ships, rows, cols);
        this.description = "Shoots spots in order";
    }
    row = 0;
    col = -1;
    GetMove(){
        this.col += 1;
        if(this.col >= this.cols){
            this.col = 0;
            this.row += 1;
        }
        let spot = [this.row, this.col];
        return spot;
    }
    LogMoveResult(row, col, result){
        super.LogMoveResult(row, col, result);
    }
    Reset(){
        super.Reset();
        this.row = 0;
        this.col = -1;
        this.board.ClearBoard();
    }
}
class Bot3 extends Player{
    // best algo
    constructor(name, ships, rows, cols){
        super(name, ships, rows, cols);
        this.description = "Shoots based on possibilities"
        this.heatmap = new Board(rows, cols);
        this.heatmaps = [];
        this.possibilities = [];
        this.foundShips = [];
        for (let i = 0; i < ships.length; i++) {
            this.foundShips.push(false);
        }
        this.bonusHeatmap = new Board(rows, cols);
        this.DefinePossibilities();
    }
    // ChangeInputs(rows,cols){
    //     super.ChangeInputs(rows,cols);
    //     this.heatmap = new Board(rows, cols);
    //     this.bonusHeatmap = new Board(rows,cols);
    // }

    GetMove(){
        this.CreateHeatmaps();
        let shuffled = this.ShuffleBoardTo1D(this.heatmap);
        let heatAndSpot = shuffled[0];
        let maxHeat = heatAndSpot[0];
        let maxSpot = heatAndSpot[1];
        for (let i = 0; i < shuffled.length; i++) {
            let hs = shuffled[i];
            if(hs[0] > maxHeat){
                maxHeat = hs[0];
                maxSpot = hs[1];
            }
        }
        return maxSpot;
    }
    LogMoveResult(row, col, result){
        super.LogMoveResult(row, col, result);
        this.UpdatePossibilities(row, col, result);
        this.FindShipsAndCloseEnds();
    }
    Reset(){
        super.Reset();
        this.board.ClearBoard();
        this.foundShips = [];
        for (let i = 0; i < this.ships.length; i++) {
            this.foundShips.push(false);
        }
        this.possibilities = [];
        this.heatmap = new Board(this.rows, this.cols);
        this.bonusHeatmap = new Board(this.rows, this.cols);
        this.DefinePossibilities();
    }

    // Other functions
    DefinePossibilities(){
        // Calls function to create all possibilities for all ships
        for(let length of this.ships){
            this.DefineShipPossibilities(length);
        }
    }
    DefineShipPossibilities(length){
        // Creates possibilities for ship
        let singleShipPossibilities = [];
        // Horizontal
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols-length+1; col++) {
                let possibility = new Board(this.rows,this.cols);
                possibility.data2D[row][col] = 1;
                for (let i = 1; i < length; i++) {
                    possibility.data2D[row][col+i] = 1;
                }
                singleShipPossibilities.push(possibility);
            }
        }
        // Vertical
        for (let row = 0; row < this.rows-length+1; row++) {
            for (let col = 0; col < this.cols; col++) {
                let possibility = new Board(this.rows,this.cols);
                possibility.data2D[row][col] = 1;
                for (let i = 1; i < length; i++) {
                    possibility.data2D[row+i][col] = 1;
                }
                singleShipPossibilities.push(possibility);
            }
        }
        this.possibilities.push(singleShipPossibilities);
    }
    
    UpdatePossibilities(row, col, isHit){
        for(let index=0; index < this.possibilities.length; index++){
            // console.log(`UpdatePoss: ${index}`);
            this.UpdateShipPossibilities(index, row, col, isHit);
        }
    }
    UpdateShipPossibilities(index, row, col, isHit){
        let newPossibilities = [];
        let shipPossibilities = this.possibilities[index];
        for (let possibility of shipPossibilities) {
            if(isHit){
                const dx = [-1, -1, 1, 1];
                const dy = [-1, 1, -1, 1];
                let count = 0;
                // Check diagonal spots
                for (let i = 0; i < 4; i++){
                    let xi = row + dx[i];
                    let yi = col + dy[i];
                    if(!this.IsInBoard(xi,yi)){
                        count++;
                        continue;
                    }
                    if(possibility.data2D[xi][yi] == 0){
                        count++;
                    }
                }
                // Adds valid possibility
                if(count == 4){
                    newPossibilities.push(possibility);
                }
                
            }
            else if(!isHit){
                if(possibility.data2D[row][col] == 0){
                    newPossibilities.push(possibility);
                }
            }
        }
        // Update
        this.possibilities[index] = newPossibilities;
    }
    
    CreateHeatmaps(){
        
        // Resets heatmaps
        this.heatmaps = [];
        for (let i = 0; i < this.ships.length; i++) {
            let shipHeatmap = new Board(this.rows,this.cols);
            this.heatmaps.push(shipHeatmap);
        }
        this.heatmap.ClearBoard();

        // Create and combine heatmaps for ships that are not found
        for (let i=0; i < this.foundShips.length; i++){
            this.CreateHeatmap(i, this.foundShips[i]);
        }
        //////////////////////////////////////////
        this.DefineNearShipSpots();
        this.MakeBonuses();

        // Apply bonus
        for (let row = 0; row < this.rows; row++){
            for (let col = 0; col < this.cols; col++){
                this.heatmap.data2D[row][col] += this.bonusHeatmap.data2D[row][col];
            }
        }

        // Update heatmap based on my moves
        for (let row = 0; row < this.rows; row++){
            for (let col = 0; col < this.cols; col++){
                if(this.board.data2D[row][col] == SHIP){
                    this.heatmap.data2D[row][col] = -1;
                }
                if(this.board.data2D[row][col] == NEAR){
                    this.heatmap.data2D[row][col] = 0;
                }
                if(this.board.data2D[row][col] == SEA){
                    this.heatmap.data2D[row][col] = 0;
                }
            }
        }
        
    }
    CreateHeatmap(index, isShipFound){
        let shipPossibilities = this.possibilities[index];
        let shipHeatmap = this.heatmaps[index];
        for (let i = 0; i < shipPossibilities.length; i++){
            for (let row = 0; row < ROWS; row++){
                for (let col = 0; col < COLS; col++){
                    if(isShipFound){
                        this.heatmaps[index].data2D[row][col] = 0;
                    }
                    else{
                        shipHeatmap.data2D[row][col] = shipHeatmap.data2D[row][col]+ shipPossibilities[i].data2D[row][col];
                    }
                    this.heatmap.data2D[row][col] += shipPossibilities[i].data2D[row][col];
                }
            }
        }
    }

    DefineNearShipSpots(){
        for (let row = 0; row < this.rows; row++){
            for (let col = 0; col < this.cols; col++){
                // If spot is ship
                if(this.board.data2D[row][col] == SHIP){
                    let dx = [-1, -1, 1, 1];
                    let dy = [-1, 1, -1, 1];
                    let count = 0;
                    // Look all diagonal neighbors
                    for (let i = 0; i < dx.length; i++){
                        let xi = row + dx[i];
                        let yi = col + dy[i];
                        if(this.IsInBoard(xi,yi)){
                            if(this.board.data2D[xi][yi] != SEA){
                                // Set to near
                                this.board.data2D[xi][yi] = NEAR;
                            }
                        }
                    }
                }
            }
        }
    }
    MakeBonuses(){
        this.bonusHeatmap.ClearBoard();
        for (let row = 0; row < this.rows; row++){
            for (let col = 0; col < this.cols; col++){
                // If spot is ship
                if(this.board.data2D[row][col] == SHIP){
                    let dx = [-1,0,1,0];
                    let dy = [0,1,0,-1];
                    let count = 0;
                    // Look all non diag neighbors
                    for (let i = 0; i < 4; i++){
                        let xi = row + dx[i];
                        let yi = col + dy[i];
                        if(this.IsInBoard(xi,yi)){
                            // Set bonus
                            this.bonusHeatmap.data2D[xi][yi] = BONUS;
                        }
                    }
                }
            }   
        }
    }

    FindShipsAndCloseEnds() {
        // Get ship spots
        let allShipSpots = [];
        let visited = new Board(this.rows,this.cols);
        let shipCount = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // If is ship spot and was not visited
                if (this.board.data2D[row][col] == SHIP && !visited.data2D[row][col]) {
                    // Start a new ship search
                    shipCount++;
                    let shipSpots = [];

                    // Recursive function to find connected hits
                    const dfs = (x, y) => {
                        if (x >= 0 && x < this.rows && y >= 0 && y < this.cols &&
                            this.board.data2D[x][y] == SHIP && !visited.data2D[x][y])
                        {
                            visited.data2D[x][y] = 1;
                            shipSpots.push([x, y]);
                            // Recursively explore neighboring spots
                            dfs(x + 1, y);
                            dfs(x - 1, y);
                            dfs(x, y + 1);
                            dfs(x, y - 1);
                        }
                    };

                    // Start search
                    dfs(row, col);
                    allShipSpots.push(shipSpots);
                }
            }
        }

        // Sort by ship length
        const compareBySize = (a, b) => {
            return a.length > b.length ? -1 : 1;
        };
        allShipSpots.sort(compareBySize);

        // Close end spots if ship is found
        this.foundShips = [];
        for(let i=0; i < this.ships.length; i++){
            this.foundShips.push(false);
        }
        for (let shipSpots of allShipSpots) {
            let firstSpot = shipSpots[0];
            let lastSpot = shipSpots[shipSpots.length - 1];
            let isHorizontal = firstSpot[0] === lastSpot[0];

            const UpdateNearSpots = () => {
                if (isHorizontal) {
                    // Set left and right spot to near
                    if (this.IsInBoard(firstSpot[0], firstSpot[1] - 1) &&
                        this.board.data2D[firstSpot[0]][firstSpot[1] - 1] == UNDEFINED)
                    {
                            this.board.data2D[firstSpot[0]][firstSpot[1] - 1] = NEAR;
                    }
                    if (this.IsInBoard(lastSpot[0], lastSpot[1] + 1) &&
                        this.board.data2D[lastSpot[0]][lastSpot[1] + 1] == UNDEFINED)
                    {
                        this.board.data2D[lastSpot[0]][lastSpot[1] + 1] = NEAR;
                    }
                } else {
                    // Set top and bottom spot to near
                    if (this.IsInBoard(firstSpot[0] - 1, firstSpot[1]) &&
                        this.board.data2D[firstSpot[0] - 1][firstSpot[1]] == UNDEFINED)
                    {
                        this.board.data2D[firstSpot[0] - 1][firstSpot[1]] = NEAR;
                    }
                    if (this.IsInBoard(lastSpot[0] + 1, lastSpot[1]) &&
                        this.board.data2D[lastSpot[0] + 1][lastSpot[1]] == UNDEFINED)
                    {
                        this.board.data2D[lastSpot[0] + 1][lastSpot[1]] = NEAR;
                    }
                }
            };
            let allShipsInOrder = [...this.ships];
            allShipsInOrder.sort((a, b) => b - a);

            let shipApplied = false;

            for (let i = 0; i < allShipsInOrder.length; i++) {
                if(shipApplied) continue;
                const shipLength = allShipsInOrder[i];
                if(shipSpots.length == shipLength && !this.foundShips[i]){
                    if(i != 0){
                        // Bigger ships that were found
                        let numberOfFoundShips = 0;
                        for (let j = i-1; j >= 0; j--) {
                            if(this.foundShips[j]){
                                numberOfFoundShips++;
                            }
                        }
                        if(numberOfFoundShips == i){
                            UpdateNearSpots();
                            shipApplied = true;
                            this.foundShips[i] = true;
                            break;
                        }
                        // Check both ends
                        let closedEnds = 0;
                        if(isHorizontal){
                            // is in board and is sea or is not in board
                            if( (this.IsInBoard(firstSpot[0],firstSpot[1]-1) &&
                               this.board.data2D[firstSpot[0]][firstSpot[1]-1]==SEA) ||
                               !this.IsInBoard(firstSpot[0],firstSpot[1]-1))
                            {
                                closedEnds++;
                            }
                            if( (this.IsInBoard(lastSpot[0],lastSpot[1]+1) &&
                               this.board.data2D[lastSpot[0]][lastSpot[1]+1]==SEA) ||
                               !this.IsInBoard(lastSpot[0],lastSpot[1]+1))
                            {
                                closedEnds++;
                            }
                        }
                        if(!isHorizontal){
                            if( (this.IsInBoard(firstSpot[0]-1,firstSpot[1]) &&
                               this.board.data2D[firstSpot[0]-1][firstSpot[1]]==SEA) ||
                               !this.IsInBoard(firstSpot[0]-1,firstSpot[1]))
                            {
                                closedEnds++;
                            }
                            if( (this.IsInBoard(lastSpot[0]+1,lastSpot[1]) &&
                               this.board.data2D[lastSpot[0]+1][lastSpot[1]]==SEA) ||
                               !this.IsInBoard(lastSpot[0]+1,lastSpot[1]))
                            {
                                closedEnds++;
                            }
                        }
                        if(closedEnds == 2){
                            if(this.foundShips[i] == false){
                                this.foundShips[i] = true;
                                shipApplied = true;
                                break;
                            }
                        }

                    }
                    else if(i == 0){
                        UpdateNearSpots();
                        shipApplied = true;
                        this.foundShips[i] = true;
                    }
                }
                
            }
        }
    }    
    
    
    IsInBoard(row, col){
        if(0 <= row && row < this.rows && 0 <= col && col < this.cols){
            return true;
        }
        return false;
    }
    ShuffleBoardTo1D(board){
        let hsArray = [];
        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.cols; col++) {
                let heatScore = board.data2D[row][col];
                let spot = [row, col];
                let heatAndSpot = [heatScore, spot];
                hsArray.push(heatAndSpot);
                // console.log(`Row:${row} Col:${col} Heat:${heatScore}`)
            }
        }
        for (let i = hsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [hsArray[i], hsArray[j]] = [hsArray[j], hsArray[i]];
        }
        return hsArray;
    }
}

//#endregion

CreateAddShipButtons(2,7);

function CreateAddShipButtons(min, max){
    for(let i = min; i<=max; i++){
        let htmlCode = 
        `
        <button class="add-ship-button" id="add-ship-button-${i}" onclick="AddShip(${i})">+${i}</button>
        `;
        document.getElementById("add-ship-buttons").innerHTML += htmlCode;
    }
}

let players = [];


let autoPlay = false;

let setupBoard = new Board(ROWS,COLS);
InitializeStartingShips();
setupBoard.AutoPlaceShips(SHIPS);

let bot3 = new Bot3("Axstr0", SHIPS, ROWS, COLS);
let bot2 = new Bot2("In Order", SHIPS, ROWS, COLS);
let bot1 = new Bot1("Random", SHIPS, ROWS, COLS);

players.push(bot3);
players.push(bot2);
players.push(bot1);

DisplayBoard(setupBoard, 'board-setup-wrapper', true)
DisplayPlayers();


//#region BUTTONS

const autoPlaceShipsButton = document.getElementById('auto-place-ships-button');
autoPlaceShipsButton.addEventListener('click', () => {
    setupBoard.AutoPlaceShips(SHIPS);
    DisplayBoard(setupBoard, 'board-setup-wrapper', true);
    Reset();
});

function AddShip(length){
    if(SHIPS.length >= SHIP_NUMBER_LIMIT) return;
    let shipCells = 0;
    if(SHIPS.length > 0){
        for(let shipLength of SHIPS){
            shipCells += shipLength;
        }
        if((shipCells+length) / (ROWS*COLS) >= SHIP_BOARD_RATIO){
            // console.log(`Can't add ship ${length} | ${(shipCells+length) / (ROWS*COLS)} >= ${SHIP_BOARD_RATIO}`);
            return;
        }
    }
    let htmlCode =
    `
    <div class="ship-selected">
        <div class="value">${length}</div>
        <button class="delete-button" onclick="RemoveShipSelected(this)">X</button>
    </div>
    `;
    document.getElementById('ship-selected-container').innerHTML += htmlCode;


    // let shipSelectedDiv = document.createElement('div');
    // shipSelectedDiv.classList.add('ship-selected');

    // let input = document.createElement('input');
    // input.value = value;
    // input.min = 2;
    // input.max = 7;
    // input.type = "number";
    // input.addEventListener('change', GetSelectedShips);

    // let button = document.createElement('button');
    // button.classList.add('delete-button');
    // button.onclick = function() {
    //     RemoveShipSelected(this);
    // };
    // button.innerHTML = "X";

    // shipSelectedDiv.appendChild(input);
    // shipSelectedDiv.appendChild(button);
    // document.getElementById('ship-selected-container').appendChild(shipSelectedDiv);

    GetSelectedShips();
}

function RemoveShipSelected(e){
    e.parentElement.remove();
    GetSelectedShips();
}

function InitializeStartingShips(){
    AddShip(5);
    AddShip(4);
    AddShip(3);
    AddShip(3);
    AddShip(2);
}

function GetSelectedShips(){
    let ships = [];
    let shipSelectedContainer = document.getElementById('ship-selected-container');
    for (var i = 0; i < shipSelectedContainer.children.length; i++) {
        var shipSelectedDiv = shipSelectedContainer.children[i];
        var value = shipSelectedDiv.children[0];
        ships.push(parseInt(value.innerHTML));
    }
    SHIPS = ships;
    // Update players
    for(let player of players){
        player.ChangeShips(SHIPS);
        player.Reset();
    }
    setupBoard.AutoPlaceShips(SHIPS);
    DisplayBoard(setupBoard, 'board-setup-wrapper', true);
}


const stepButton = document.getElementById('step-button');
stepButton.addEventListener('click', () => {
    autoPlay = false;
    Step();
});
const playButton = document.getElementById('play-button');
playButton.addEventListener('click', () => {
    autoPlay = !autoPlay;
    Play();
});
const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', () => {
    Reset();
});

function Step(){
    for (let i in players){
        let player = players[i];
        if(player.IsFinished() || player.moves >= player.rows*player.cols*2) continue;
        let [row, col] = player.GetMove();
        //console.log(`r:${row} c:${col}`)
        let result = setupBoard.GiveFeedback(row, col);
        player.LogMoveResult(row, col, result);
    }
    DisplayPlayers();
}

async function Play(){
    // Reset();
    autoPlay = true;
    while(true) {
        if(!autoPlay) break;
        Step();
        let finishedPlayers = 0;
        for(let i in players){
            let player = players[i];
            if(player.IsFinished()) finishedPlayers += 1;
            else{
                if(player.moves >= player.rows*player.cols*2) finishedPlayers += 1;
            }
        }
        if(finishedPlayers == players.length) break;
        await sleep(10); ///////////////// SLEEP //////////////
    }
}

function Reset(){
    autoPlay = false;
    for(let i in players){
        let player = players[i];
        player.Reset();
    }
    DisplayPlayers();
}

//#endregion

//#region SLIDERS

const rowsSlider = document.getElementById('rows-slider');
const rowsSliderValue = document.getElementById('rows-slider-value');
rowsSliderValue.innerHTML = rowsSlider.value;
rowsSlider.addEventListener("input", function() {
    let shipCells = 0;
    for(let length of SHIPS){
        shipCells += length;
    }
    if(shipCells / (parseInt(rowsSlider.value)*COLS) >= SHIP_BOARD_RATIO){
        if(rowsSlider.value <= ROWS){
            rowsSlider.value = ROWS;
            return;
        }
    }
    
    autoPlay = false;
    ROWS = parseInt(rowsSlider.value);
    rowsSliderValue.innerHTML = rowsSlider.value;
    // Change setup board
    setupBoard.ChangeRowsCols(ROWS,COLS);
    // Change players
    for(let player of players){
        player.ChangeRowsCols(ROWS,COLS);
        player.Reset();
    }
    DisplayPlayers();
    setupBoard.AutoPlaceShips(SHIPS);
    DisplayBoard(setupBoard, 'board-setup-wrapper', true);
});

const colsSlider = document.getElementById('cols-slider');
const colsSliderValue = document.getElementById('cols-slider-value');
colsSliderValue.innerHTML = colsSlider.value;
colsSlider.addEventListener("input", function() {
    let shipCells = 0;
    for(let length of SHIPS){
        shipCells += length;
    }
    if(shipCells / (ROWS*parseInt(colsSlider.value)) >= SHIP_BOARD_RATIO){
        if(colsSlider.value <= COLS){
            colsSlider.value = COLS;
            return;
        }
    }

    autoPlay = false;
    COLS = parseInt(colsSlider.value);
    colsSliderValue.innerHTML = colsSlider.value;
    // Change setup board
    setupBoard.ChangeRowsCols(ROWS,COLS);
    // Change players
    for(let player of players){
        player.ChangeRowsCols(ROWS,COLS);
        player.Reset();
    }
    DisplayPlayers();
    setupBoard.AutoPlaceShips(SHIPS);
    DisplayBoard(setupBoard, 'board-setup-wrapper', true);

    // var boardCells = document.querySelectorAll(".board-cell");
    // for(let boardCell of boardCells){
    //     boardCell.style.width = `${Math.Round(300/COLS)}px`;
    // }
});

//#endregion


// window.addEventListener('resize', function() {
//     // Code to be executed when the screen is resized
//     console.log('Screen resized!');
//     // Change players
    
//     DisplayPlayers();
//     DisplayBoard(setupBoard, 'board-setup-wrapper', true);
// });


//#region DISPLAY FUNCTIONS

function DisplayBoard(board, divId, showShips){
    let gap = 2;
    let boardWrapperHeight = 0;
    let boardWrapperWidth = 0;
    if(divId == 'board-setup-wrapper'){
        let boardSetupWrapperDiv = document.querySelector('.board-setup-wrapper');
        let computed = window.getComputedStyle(boardSetupWrapperDiv);
        boardWrapperHeight = computed.getPropertyValue('height').slice(0, -2);
        boardWrapperWidth = computed.getPropertyValue('width').slice(0, -2);
    }
    else {
        let playerDiv = document.querySelector('.board-wrapper');
        let computed = window.getComputedStyle(playerDiv);
        boardWrapperHeight = computed.getPropertyValue('height').slice(0, -2);
        boardWrapperWidth = computed.getPropertyValue('width').slice(0, -2);
    }
    let cellSize = 0;
    if(boardWrapperHeight >= boardWrapperWidth){
        if(board.rows > board.cols){
            cellSize = (boardWrapperHeight-(board.rows-1)*gap) / board.rows;
        }
        else if(board.rows <= board.cols){
            cellSize = (boardWrapperWidth-(board.cols-1)*gap) / board.cols;
        }
    }
    else if(boardWrapperHeight < boardWrapperWidth){
        if(board.rows >= board.cols){
            cellSize = (boardWrapperHeight-(board.rows-1)*gap) / board.rows;
        }
        else if(board.rows < board.cols){
            cellSize = (boardWrapperWidth-(board.cols-1)*gap) / board.cols;
        }
    }
    // cellSize = Math.round(cellSize)-1;
    // if(divId == 'board-setup-wrapper'){
    //     cellSize = (document.getElementById('left').offsetHeight*0.65)/board.rows;
    // }
    // else{
    //     cellSize = (document.getElementById('players').offsetHeight*0.55) / board.rows;
    // }
    let parentDiv = document.getElementById(divId);
    parentDiv.innerHTML = "";
    let cellsHtml = "";
    for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
            if(showShips){
                let cellClass = "";
                switch (board.data2D[row][col]) {
                    case UNDEFINED:
                        cellClass = "undefined-cell";
                        break;
                    case SEA:
                        cellClass = "sea-cell";
                        break;
                    case SHIP:
                        cellClass = "ship-cell";
                        break;
                    case NEAR:
                        cellClass = "near-cell";
                        break;
                                    
                    default:
                        break;
                }
                cellsHtml += 
                `
                <div class="board-cell ${cellClass}"></div>
                `;
                
            }
            else{
                cellsHtml += 
                `
                <div class="board-cell"></div>
                `;
            }
        }
    }
    let htmlCode = 
    `
    <div class="board" style="
        grid-template-rows: repeat(${board.rows},${cellSize}px);
        grid-template-columns: repeat(${board.cols},${cellSize}px);
        gap: ${gap}px;"
    >
        ${cellsHtml}
    </div>
    `;
    parentDiv.innerHTML = htmlCode;
}

function DisplayPlayers(){
    let playersDiv = document.getElementById('players');
    playersDiv.innerHTML = "";
    for(let i in players){
        let player = players[i];
        DisplayPlayer(player);
    }
}

function DisplayPlayer(player){
    let playersDiv = document.getElementById('players');
    let htmlCode = 
    `
    <div id="player-${player.name}" class="player">
        <div class="player-name">${player.name}</div>
        <div id="board-wrapper-${player.name}" class="board-wrapper">
            <!-- <div class="board"> v js </div> -->
        </div>
        <div class="stats">
            <div class="moves">Moves: <span class="value">${player.moves}</span></div>
        </div>
    </div>
    `;
    playersDiv.innerHTML += htmlCode;
    DisplayBoard(player.board, `board-wrapper-${player.name}`, true)
}

//#endregion



//#region HELPER FUNCTIONS

function RandomIntFromInterval(min, max) { // min and max included 
    // console.log(`min:${min} max:${max}`)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//#endregion
