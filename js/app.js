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

const openRules = () => {
    $('#rules-modal').css('display', 'block');
}
  
const closeRules = () => {
    $('#rules-modal').css('display', 'none');
}

const startGame = () => {
    resetColors();
    nextGame(player1, player2);
    playButton();
}

const playButton = () => {
    $('#start-game').css('opacity', '0%');
    $('.player').css('opacity', '100%');
    $('#round-display h1').css('opacity', '100%');
    $('#play-icon').attr('src', 'img/play.png');
    $('#play').on('click', async () => {
        roundDisplay();
        resetColors();
        $('#timer').css({       
            "width": '100%',
            "background-color": "rgba(102,255,0,1)"
        })
        $('#selection').empty();
        const songAnswer = selectSongAnswer(songList);
        $('#song').attr('src', songAnswer.path);
        beginRound(3, songAnswer, songList);
    }); 
}

const nextRound = () => {
    $(document).off('keypress');
    $('#play-icon').attr('src', 'img/play.png');
    if (currentRound < rounds)
        playButton();
    else
        gameOver();
}

const roundDisplay = () => {
    currentRound++;
    $('#round-number').text(currentRound);
}
const gameOver = () => {
    $('#play').on('click', () => {
        resetColors();
        if (player1.getScore() === player2.getScore()) {
            Swal.fire({
                title: 'Tie Game!',
            });
        }
        else if (player1.getScore() > player2.getScore()) {
            Swal.fire({
                title: 'Player 1 Wins!',
            });
            player1.addWin();
        }
        else {
            Swal.fire({
                title: 'Player 2 Wins!',
            });
            player2.addWin();
        }
        $('#play').off('click');
        $('#round-display h1').text("Game Over");
        $('#play-icon').attr('src', 'img/note.gif');
        $('#start-game').css('opacity', '100%').text('Next Game!');
    }); 
}

const displayWins = (winner) => {
    winner.addWin();
    $(`${winner.getDivID()} .wins span`).text(winner.getWins());
}

const nextGame = (playerA, playerB) => {
    playerA.newGame();
    playerB.newGame();
    $(`${playerA.getDivID()} .score h1`).text(playerA.getScore());
    $(`${playerB.getDivID()} .score h1`).text(playerB.getScore());
    $(`${playerA.getDivID()} .nail img`).css('opacity', '100%');
    $(`${playerA.getDivID()} .5050 img`).css('opacity', '100%');
    $(`${playerB.getDivID()} .nail img`).css('opacity', '100%');
    $(`${playerB.getDivID()} .5050 img`).css('opacity', '100%');
    $('#round-display h1').remove();
    $('#round-display').prepend('<h1>Round <span id="round-number">1</span></h1>');
    currentRound = 0;
}

//Returns an available song as the selected answer for the round
const selectSongAnswer = (songArray) =>  {
    //tests to see if at least 4 songs are available
    //this is done to make sure at least one unused correct song is picked
    //and three unused incorrect songs can be displayed as well
    //if less than 4, resets all some to being available (true)
    if (songArray.filter(songElement => songElement.available === true).length < 4) {
        for (let element of songArray)
        element.available = true;
    }
    //select an available song
    let song = filterAvailableSong(songArray);
    //find the chosen song in the original data and mark it false (unavailable)
    for (let i = 0; i < songArray.length; i++) {
        if (songArray[i].title === song.title) {
            songArray[i].available = false;
            break;
        }
    }
    return song;
}

//Finds all songs listed as available and returns a random song from that selection
const filterAvailableSong = (songArray) => {
    let availableSongs = songArray.filter(songElement => songElement.available === true);
    //Picks and returns a random song from available selection
    let song = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    return song;
}

const beginRound = (seconds, rightAnswer, songArray) => {
    $('#play').off('click');
    const oneSecond = () => {
        return new Promise(resolve => {setTimeout(resolve, 1000);});
    }
    const countDown = async (seconds) => {
        for (let i = seconds; i > 0; i--) {
            $('#play').css('opacity', '100%').text(i);
            $('#play').animate({
                opacity: '0%'
            }, 900);
            await oneSecond();
        }
        $('#play').css('opacity', '100%').text("");
        $('#play').append(`<img id="play-icon" src="img/questionmark.gif"/>`)
        const $audio = $('audio').get(0);
        $audio.play();
        setTimeout(() => {
            $audio.pause();
        }, 1000);
        timer(5000, beginBuzzer, endBuzzer);
        displayAnswers(rightAnswer, songArray);
    }
    countDown(seconds);
}
    
const timer = (length, startFunc, endFunc) => {
    $('#timer').stop();
    $('#timer').css({
        "background-color": "rgba(102,255,0,1)",
        "width": `${$('#answers').width()}`
    })
    $('#timer').animate({
        "background-color": "red",
        "width": "0px"
    }, {
        duration: length,
        start: () => {startFunc();},
        complete: () => {endFunc();}
    });
}
    
//Appends to the #selection UL 4 possible answers with the correct answer randomly placed
const displayAnswers = (rightAnswer, songArray) => {
    //select a place for the correct answer to display
    let correctSpot = Math.floor(Math.random() * 4);
    //returns an array of available songs to select wrong answers from
    let wrongAvailables = songArray.filter(songElement => songElement.available === true);
    for (let i = 0; i < 4; i++){
        //append the right answer at placement i
        if (i === correctSpot){
            const $li = $('<li>').attr('class', 'correct-answer');
            $li.text(`${rightAnswer.artist} - "${rightAnswer.title}"`);
            $('#selection').append($li);
        }
        //else, finds a random wrong answer to append instead
        else {
            wrongIndex = Math.floor(Math.random() * wrongAvailables.length);
            const wrongAnswer = wrongAvailables[wrongIndex];
            //splicing the element out from the available selection to prevent
            //multiple printings of wrong answers
            wrongAvailables.splice(wrongIndex, 1);
            const $li =  $(`<li>`).attr('class', 'wrong-answer');
            $li.text(`${wrongAnswer.artist} - "${wrongAnswer.title}"`);
            $('#selection').append($li);
        }
    }
}

const toggleBuzz = () => {
    player1.canBuzz = !player1.canBuzz;
    player2.canBuzz = !player2.canBuzz;
}

const beginBuzzer = () => {
    toggleBuzz();
    $(document).keypress((event) => {
        if (event.which === player1.getBuzzKey().charCodeAt(0) && player1.canBuzz) {
            timer(5000, () => {}, () => {noAnswers(player1)});
            toggleBuzz();
            $(player1.getDivID()).css('background-color', "rgb(0, 195, 255)").effect('pulsate', {times:2}, 200);
            playerChoice(player1, player2);

        }
        else if (event.which === player2.getBuzzKey().charCodeAt(0) && player2.canBuzz) {
            timer(5000, () => {}, () => {noAnswers(player2)});
            toggleBuzz();
            $(player2.getDivID()).css('background-color', "rgb(0, 195, 255)").effect('pulsate', {times:2}, 200);
            playerChoice(player2, player1);
        }
    });
}

//Is only called if no players buzz at all during round
const endBuzzer = () => {
    toggleBuzz();
    displayCorrectAnswer();
    playFullSong();
    nextRound();
}

const displayCorrectAnswer = () => {
    const $answers = $('#selection li');
    for (let i = 0; i < $answers.length; i++) {
        if ($($answers[i]).attr('class') === 'correct-answer')
            $($answers[i]).animate({backgroundColor: "green"});
    }
}

const displayWrongAnswer = ($selection) => {
    $($selection).animate({backgroundColor: "red"}, 150).effect('shake', {times:2}, 200);
}

const playerChoice = (player, opponent) => {
    $(document).keypress((event) => {
        const $answers = $('#selection li');
        //when a player wishes to make an answer
        if (event.which === '1'.charCodeAt(0) || event.which === '2'.charCodeAt(0) ||
            event.which === '3'.charCodeAt(0) || event.which === '4'.charCodeAt(0)) {
            choiceVerify(player, event);
        }
        //when a player uses 50/50
        if ((event.which === 'c'.charCodeAt(0) || event.which === 'C'.charCodeAt(0))
            && player.can5050()) {
            use5050(player);
            $(document).off('keypress');
            let deletedTwo = 0;
            let remainingIndex = [1, 2, 3, 4];
            while (deletedTwo < 2) {
                let randomIndex = Math.floor(Math.random() * $answers.length);
                if ($($answers[randomIndex]).attr('class') === "wrong-answer" &&
                    $($answers[randomIndex]).text() !== '-') {
                    $($answers[randomIndex]).text('-').css('list-style-type', 'none');
                    remainingIndex[randomIndex] = 0;
                    deletedTwo++;
                }
            }
            remainingIndex = remainingIndex.filter(element => element !== 0);
            $(document).keypress((event) => {
                if (event.which === `${remainingIndex[0]}`.charCodeAt(0) || 
                    event.which === `${remainingIndex[1]}`.charCodeAt(0)) {
                        choiceVerify(player, event);
                }
            })
        }
        //when a player uses a nail
        if ((event.which === 'n'.charCodeAt(0) || event.which === 'N'.charCodeAt(0))
            && player.canNail()) {
            useNail(player);
            //turn off dom to prevent pressing other options
            $(document).off('keypress');
            //dom to change other players color to indicate they must answer now
            $(opponent.getDivID()).css('background-color', "rgb(255, 115, 0)");
            //reset timer for them, and if they don't answer in time,
            //player gains points, opponent loses points
            timer(5000, () => {}, () => {nailTimeLimit(opponent, player)});
            //turn listener back on and make selection
            $(document).keypress((event) => {
                if (event.which === '1'.charCodeAt(0) || event.which === '2'.charCodeAt(0) ||
                    event.which === '3'.charCodeAt(0) || event.which === '4'.charCodeAt(0)) {
                    let selection = String.fromCharCode(event.which) - 1;
                    if ($($answers[selection]).attr('class') === 'correct-answer') {
                        $('#timer').stop();
                        opponent.addPoint();
                        player.subtractPoint();
                    }      
                    else {
                        $('#timer').stop();
                        displayWrongAnswer($answers[selection]);
                        opponent.subtractPoint();
                        player.addPoint();
                    }
                displayCorrectAnswer();
                playFullSong();
                nextRound();
                }
            })
        }
    })
}

const useNail = (player) => {
    player.hasNail = false;
    $(`${player.getDivID()} .nail img`).css('opacity', '25%').effect('pulsate');
}

const use5050 = (player) => {
    player.has5050 = false;
    $(`${player.getDivID()} .5050 img`).css('opacity', '25%').effect('pulsate');
}

const choiceVerify = (player, event) => {
    const $answers = $('#selection li');
    let selection = String.fromCharCode(event.which) - 1;
    if ($($answers[selection]).attr('class') === 'correct-answer') {
        player.addPoint();
    }      
    else {
        displayWrongAnswer($answers[selection]);
        player.subtractPoint();
    }
    $('#timer').stop();
    displayCorrectAnswer();
    playFullSong();
    nextRound();
}

const playFullSong = () => {
    $('audio').get(0).currentTime = 0;
    $('audio').get(0).play();
}

//Called if a player buzzes but does not answer
const noAnswers = (player) => {
    player.subtractPoint();
    displayCorrectAnswer();
    playFullSong();
    nextRound();
}

//Called if time limit reached when a player gets nailed
const nailTimeLimit = (nailee, nailer) => {
    nailee.subtractPoint();
    nailer.addPoint();
    displayCorrectAnswer();
    playFullSong();
    nextRound();
}

const resetColors = () => {
    $('#player1').css('background-color', "rgba(0, 0, 0, 0");
    $('#player2').css('background-color', "rgba(0, 0, 0, 0");
}

$(() => {
    $('#rules-button').on('click', openRules);
    $('#close-button').on('click', closeRules);
    $('#start-game').on('click', startGame);
})
