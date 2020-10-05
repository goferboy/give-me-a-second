class Player {
    constructor(key) {
        this.points = 0;
        this.wins = 0;
        this.hasScrew = true;
        this.has5050 = true;
        this.buzzKey = key;
        this.canBuzz = false;
    }
    addPoint() {
        this.points++;
    }
    subtractPoint() {
        this.points--;
    }
    addWin() {
        this.wins++;
    }
    getBuzzKey() {
        return this.buzzKey;
    }
    toggleBuzz() {
        this.canBuzz = !this.canBuzz;
    }
    
}

const player1 = new Player('a');
const player2 = new Player('l');

let rounds = 5;

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

//Alters the attr for #song-data and plays the file
// const playSong = (song) => {
//     const delay = (seconds) => new Promise(() => {
//         const oneSecond = () => {
//             return new Promise(resolve => {setTimeout(resolve, 1000);})}
//         const countdown = async (seconds) => {
//             for (let i = seconds; i > 0; i--) {
//                 $('#play').text(i);
//                 await oneSecond();
//             }
//             $('#play').text("Play");
//             $('audio').get(0).play();
//         }
//         countdown(seconds);
//     })
//     delay(3);
// }

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
        timer(5000);
        displayAnswers(rightAnswer, songArray);
    }
    countdown(seconds);
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

const openRules = () => {
    $('#rules-modal').css('display', 'block');
}

const closeRules = () => {
    $('#rules-modal').css('display', 'none');
}

const startGame = () => {
    $('#start-game').css('display', 'none');
    $('#main-display').css('display', 'block');
    playButton();
}

const timer = (length) => {
    $('#timer').animate({
        "background-color": "red",
        "width": "0px"
    }, {
        duration: length,
        start: () => {beginBuzzer();},
        done: () => {/*a function that stops players from buzzing in and displays results*/console.log("animation ended")}
    });
}

const beginBuzzer = () => {
    player1.toggleBuzz();
    player2.toggleBuzz();
    $(document).keypress((event) => {
        if (event.which === player1.getBuzzKey().charCodeAt(0)){
            player2.toggleBuzz();
            playerBuzzerSelect($('#player1'));
            console.log('pressed A')
        }
        else if (event.which === player2.getBuzzKey().charCodeAt(0)) {
            player1.toggleBuzz();
            //display feedback
        }
        // selectSongAnswer();
    });
}

const playerBuzzerSelect = ($player) => {
    $player.css('background-color', "rgb(0, 195, 255)")
}

const playButton = () => {
    $('#play').on('click', async () => {
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


$(() => {
    $('#rules-button').on('click', openRules);
    $('#close-button').on('click', closeRules);
    $('#start-game').on('click', startGame);
})
