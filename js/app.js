class Player {
    constructor(key, divID) {
        this.points = 0;
        this.wins = 0;
        this.hasScrew = true;
        this.has5050 = true;
        this.buzzKey = key;
        this.canBuzz = false;
        this.divID = divID;
    }
    addPoint() {
        this.points+=100;
    }
    subtractPoint() {
        this.points-=100;
    }
    getScore() {
        return this.points;
    }
    addWin() {
        this.wins++;
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
    canScrew() {
        return this.hasScrew;
    }
    getDivID() {
        return this.divID;
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
    if (currentRound < rounds) {
        playButton();
    }
    else {
        roundOver();
    }
}

const playButton = () => {
    roundCheck();
    $('#play').on('click', async () => {
        resetColors();
        $('#timer').css({
            "width": "300px",
            "background-color": "rgba(102,255,0,1)"
        })
        $('#selection').empty();
        const songAnswer = selectSongAnswer(songList);
        $('#song').attr('src', songAnswer.path);
        beginRound(3, songAnswer, songList);
    }); 
}

const roundCheck = () => {
    currentRound++;
    $('#round-number').text(currentRound);
    $('#start-game').css('display', 'none');
    $('#main-display').css('display', 'block');
}
const roundOver = () => {
    if (player1.getScore() === player2.getScore()) {
        alert("It's A Tie!");
    }
    else if (player1.getScore() > player2.getScore()) {
        alert("Player 1 Wins!")
        player1.addWin();
        $('#p1-wins').text(player1.getWins());
    }
    else {
        alert("Player 2 Wins!")
        player2.addWin();
        $('#p2-wins').text(player1.getWins());
    }
    currentRound = 0;
    playButton();
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
        return new Promise(resolve => {setTimeout(resolve, 1000);})}
        const countdown = async (seconds) => {
            for (let i = seconds; i > 0; i--) {
                $('#play').text(i);
                await oneSecond();
            }
            $('#play').text("Play");
            $('audio').get(0).play();
            timer(5000, beginBuzzer, endBuzzer);
            displayAnswers(rightAnswer, songArray);
        }
    countdown(seconds);
}
    
const timer = (length, startFunc, endFunc) => {
    $('#timer').stop();
    $('#timer').css({
        "background-color": "rgba(102,255,0,1)",
        "width": "300px"
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
    $(document).off('keypress');
    displayCorrectAnswer();
    startGame();
}

const displayCorrectAnswer = () => {
    const $answers = $('li');
    for (let i = 0; i < $answers.length; i++) {
        if ($($answers[i]).attr('class') === 'correct-answer')
            $($answers[i]).animate({backgroundColor: "green"});
    }
}

const displayWrongAnswer = ($selection) => {
    $($selection).animate({backgroundColor: "red"}, 150).effect('bounce');
}

const playerChoice = (player, opponent) => {
    $(document).keypress((event) => {
        //when a player wishes to make an answer
        if (event.which === '1'.charCodeAt(0) || event.which === '2'.charCodeAt(0) ||
            event.which === '3'.charCodeAt(0) || event.which === '4'.charCodeAt(0)) {
            choiceVerify(player, event);
        }
        //when a player uses 50/50
        if ((event.which === 'n'.charCodeAt(0) || event.which === 'N'.charCodeAt(0))
            && player.can5050()) {
            const $answers = $('li');
            player.has5050 = false;
            $(document).off('keypress');
            let deletedTwo = 0;
            let remainingIndex = [1, 2, 3, 4];
            while (deletedTwo < 2) {
                let randomIndex = Math.floor(Math.random() * $answers.length);
                console.log($($answers[randomIndex]).attr('class'));
                if ($($answers[randomIndex]).attr('class') === "wrong-answer" &&
                    $($answers[randomIndex]).text() !== "") {
                    $($answers[randomIndex]).text("");
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
            //insert DOM to remove 50/50 icon
        }
        //when a player uses a screw
        if ((event.which === 'c'.charCodeAt(0) || event.which === 'C'.charCodeAt(0))
            && player.canScrew()) {
            player.hasScrew = false;
            //turn off dom to prevent pressing other options
            $(document).off('keypress');
            //dom to change other players color to indicate they must answer now
            $(opponent.getDivID()).css('background-color', "rgb(255, 115, 0)");
            //reset timer for them, and if they don't answer in time,
            //player gains points, opponent loses points
            timer(5000, () => {}, () => {screwTimeLimit(opponent, player)});
            //turn listener back on and make selection
            $(document).keypress((event) => {
                const $answers = $('li');
                if (event.which === '1'.charCodeAt(0) || event.which === '2'.charCodeAt(0) ||
                    event.which === '3'.charCodeAt(0) || event.which === '4'.charCodeAt(0)) {
                    let selection = String.fromCharCode(event.which) - 1;
                    if ($($answers[selection]).attr('class') === 'correct-answer') {
                        $('#timer').stop();
                        console.log('correct!')
                        opponent.addPoint();
                        player.subtractPoint();
                    }      
                    else {
                        $('#timer').stop();
                        console.log('it wrong!');
                        opponent.subtractPoint();
                        player.addPoint();
                    }
                $(`${player.getDivID()} .score span`).text(player.getScore());
                $(`${opponent.getDivID()} .score span`).text(opponent.getScore());
                $(document).off('keypress');
                startGame();
                }
            })
        }
    })
}

const choiceVerify = (player, event) => {
    const $answers = $('li');
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
    $(`${player.getDivID()} .score span`).text(player.getScore());
    $(document).off('keypress');
    startGame();
}
//Called if a player buzzes but does not answer
const noAnswers = (player) => {
    player.subtractPoint();
    $(`${player.getDivID()} .score span`).text(player.getScore());
    $(document).off('keypress');
    startGame();
}

const screwTimeLimit = (screwee, screwer) => {
    screwee.subtractPoint();
    screwer.addPoint();
    $(`${screwee.getDivID()} .score span`).text(player.getScore());
    $(`${screwer.getDivID()} .score span`).text(player.getScore());
    $(document).off('keypress');
    startGame();
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
