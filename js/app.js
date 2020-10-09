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

//Resets the players boxes back to invisable, signifying neither are active
const resetColors = () => {
    $('#player1').css('background-color', "rgba(0, 0, 0, 0");
    $('#player2').css('background-color', "rgba(0, 0, 0, 0");
}

//Resets player values (except wins) and DOM/display elements
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

//sets up the listeners for the play button before a round begins.
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

//increments round counter and modifies the DOM to reflect the change
const roundDisplay = () => {
    currentRound++;
    $('#round-number').text(currentRound);
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

//Does a countdown length based on 'seconds' argument till song plays, then starts timer
//and displays possible answers for players 
const beginRound = (seconds, rightAnswer, songArray) => {
    $('#play').off('click');
    //helper function that returns a promise after one second has passed
    const oneSecond = () => {
        return new Promise(resolve => {setTimeout(resolve, 1000);});
    }
    const countDown = async (seconds) => {
        //injects a countdown timer with some animation effects
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
        //pauses the audio after one second.
        setTimeout(() => {
            $audio.pause();
        }, 1000);
        timer(5000, beginBuzzer, endBuzzer);
        displayAnswers(rightAnswer, songArray);
    }
    countDown(seconds);
}

//Length is passed as a positive integer, in milliseconds. Can also pass starting and ending
//functions. Typically the ending functions passed are when the timer runs out
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

//Turns on listeners for player's buzzers, as well as animations 
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

const toggleBuzz = () => {
    player1.canBuzz = !player1.canBuzz;
    player2.canBuzz = !player2.canBuzz;
}

//After a player buzzes, turns on and off listeners at appropriate times based on selection
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
            //turn off dom to prevent pressing other options
            $(document).off('keypress');
            //deleteTwo variable keeps track for while lop to make sure two answers are deleted
            let deletedTwo = 0;
            //remainingIndex provides which numeral selections are available after the deletion
            let remainingIndex = [1, 2, 3, 4];
            //While loop as its possible for a randomIndex to get the same number more than once
            while (deletedTwo < 2) {
                let randomIndex = Math.floor(Math.random() * $answers.length);
                //Verifies that the randomIndex is empty, otherwise runs another iteration
                if ($($answers[randomIndex]).attr('class') === "wrong-answer" &&
                    $($answers[randomIndex]).text() !== '-') {
                    $($answers[randomIndex]).text('-').css('list-style-type', 'none');
                    //marks coinciding index to 0 to help filter available answers after loop
                    remainingIndex[randomIndex] = 0;
                    deletedTwo++;
                }
            }
            //filters out all 0 marked indexes, returning an array with only two elements
            //containing the respective numebrs of the remaining answers
            remainingIndex = remainingIndex.filter(element => element !== 0);
            //turn listeners back on for those elements
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

//Checks to see if the answer (event) matches the correct-answer
//Adds points to the player if it does, other wises subtracts points
//Then resolves round by showing answer, playing the song, and
//going to the nest round
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

const displayCorrectAnswer = () => {
    const $answers = $('#selection li');
    for (let i = 0; i < $answers.length; i++) {
        if ($($answers[i]).attr('class') === 'correct-answer')
            $($answers[i]).animate({backgroundColor: "green"});
    }
}

const displayWrongAnswer = ($selection) => {
    $($selection).animate({backgroundColor: "red"}, 150);
}

const useNail = (player) => {
    player.hasNail = false;
    $(`${player.getDivID()} .nail img`).css('opacity', '25%').effect('pulsate');
}

const use5050 = (player) => {
    player.has5050 = false;
    $(`${player.getDivID()} .5050 img`).css('opacity', '25%').effect('pulsate');
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

//Plays the current loaded song till completed
const playFullSong = () => {
    $('audio').get(0).currentTime = 0;
    $('audio').get(0).play();
}

//Decides if there is another round to play, otherwise, the game is over.
const nextRound = () => {
    $(document).off('keypress');
    $('#play-icon').attr('src', 'img/play.png');
    if (currentRound < rounds)
        playButton();
    else
        gameOver();
}

//After all rounds are completed, figures out who won
const gameOver = () => {
    $('#play').on('click', () => {
        resetColors();
        if (player1.getScore() === player2.getScore()) {
            Swal.fire({
                background: "#D5FB9D",
                icon: 'question',
                title: 'Tie Game! NO WINNERS HERE!',
                confirmButtonColor: "#873ffc",
                confirmButtonText: "What?!"
            });
        }
        else if (player1.getScore() > player2.getScore()) {
            Swal.fire({
                background: "#D5FB9D",
                title: 'Congrats, Player 1! You Win!',
                icon: 'success',
                confirmButtonColor: "#873ffc",
                confirmButtonText: "Yay!"
            });
            player1.addWin();
        }
        else {
            Swal.fire({
                background: "#D5FB9D",
                title: 'Congrats, Player 2! You Win!',
                icon: 'success',
                confirmButtonColor: "#873ffc",
                confirmButtonText: "Yay!"
            });
            player2.addWin();
        }
        $('#play').off('click');
        $('#round-display h1').text("Game Over");
        $('#play-icon').attr('src', 'img/note.gif');
        $('#start-game').css('opacity', '100%').text('Next Game!');
    }); 
}

//Initial listeners upon startup of game, opening and closing of the rules
//and start of the game.
$(() => {
    $('#rules-button').on('click', openRules);
    $('#close-button').on('click', closeRules);
    $('#start-game').on('click', startGame);
})
