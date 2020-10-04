const selectSongAnswer = (songArray) =>  {
    //tests to see if at least 4 songs are available
    //this is done to make sure at least one unused correct song is picked
    //and three unused incorrect songs can be displayed as well
    //if true, resets all some to being available (true)
    //Filters songs that are available
    if (songArray.filter(songElement => songElement.available === true).length < 4) {
        for (let element of songArray)
            element.available = true;
    }
    // //tests if all songs have been used
    // //if true, resets all some to being available (true)
    // if (songArray.filter(songElement => songElement.available === true).length === 0) {
    //     for (let element of songArray)
    //         element.available = true;
    // }
    // //Filters songs that are available
    // let availableSongs = songArray.filter((songElement) => {
    //     return songElement.available === true});
    // //Picks a random song from available selection
    // let song = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    
    //select and available song
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

const filterAvailableSong = (songArray) => {
    let availableSongs = songArray.filter((songElement) => {
        return songElement.available === true});
    //Picks and returns a random song from available selection
    let song = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    return song;
}

const returnAvailableSongs = (songArray) => {
    return songArray.filter((songElement) => {return songElement.available === true});
}

const playSong = (song) => {
    $('#song-data').attr('src', song.path);
    $('audio').get(0).play();
}

//Generates a unordered lists of 4 possible answers with the correct answer randomly placed
const displayAnswers = (rightAnswer, songArray) => {
    //select a place for the correct answer
    let correctSpot = Math.floor(Math.random() * 4);
    let wrongAvailables = songArray.filter((songElement) => {return songElement.available === true});
    for (let i = 0; i < 4; i++){
        if (i === correctSpot){
            const $li = $('<li>').attr('class', 'correct-answer');
            $li.text(`${rightAnswer.artist} - "${rightAnswer.title}"`);
            console.log(`Correct Answer: ${$($li).text()} in ${i+1}`);
            $('#selection').append($li);
        }
        else {
            wrongIndex = Math.floor(Math.random() * wrongAvailables.length);
            const wrongAnswer = wrongAvailables[wrongIndex];
            wrongAvailables.splice(wrongIndex, 1);
            const $li =  $(`<li>`).attr('class', 'wrong-answer');
            $li.text(`${wrongAnswer.artist} - "${wrongAnswer.title}"`);
            $('#selection').append($li);
        }
    }
}


$(() => {
    $('#play').on('click', () => {
        $('#selection').empty();
        const songAnswer = selectSongAnswer(songList);
        playSong(songAnswer);
        displayAnswers(songAnswer, songList);
    })
})
