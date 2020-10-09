//Class for Player data with methods
//as well as basic initialization for game variables used throughout

class Player {
    constructor(key, divID) {
        this.points = 0;
        this.wins = 0;
        this.hasNail = true;
        this.has5050 = true;
        this.buzzKey = key;
        this.canBuzz = false;
        this.divID = divID;
    }
    addPoint() {
        this.points+=100;
        $(`${this.getDivID()} .score h1`).css("color", "green").text(this.points);
        $(`${this.getDivID()} .score h1`).animate({
            color: "black"
        }, 1000);
    }
    subtractPoint() {
        this.points-=100;
        $(`${this.getDivID()} .score h1`).css("color", "red").text(this.points);
        $(`${this.getDivID()} .score h1`).animate({
            color: "black"
        }, 1000);
    }
    getScore() {
        return this.points;
    }
    addWin() {
        this.wins++;
        $(`${this.getDivID()} .wins span`).css("color", "green").text(this.wins);
        $(`${this.getDivID()} .wins span`).animate({
            color: "black"
        }, 1000);
    }
    getWins() {
        return this.wins;
    }
    getBuzzKey() {
        return this.buzzKey;
    }
    can5050() {
        return this.has5050;
    }
    canNail() {
        return this.hasNail;
    }
    getDivID() {
        return this.divID;
    }
    newGame() {
        this.points = 0;
        this.hasNail = true;
        this.has5050 = true;
    }
}

const player1 = new Player('a', "#player1");
const player2 = new Player('l', "#player2");

let rounds = 5;
let currentRound = 0;
