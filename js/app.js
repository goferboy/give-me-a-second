const selectSong = (songArray) =>  {
    //tests if all songs have been used
    //if true, resets all some to being available (true)
    if (songArray.filter(songElement => songElement.available === true).length === 0) {
        for (let element of songArray)
            element.available = true;
    }
    //Filters songs that are available
    console.log(songList);
    let availableSongs = songArray.filter((songElement) => {
        return songElement.available === true});
    console.log(availableSongs);
    //Picks a random song from available selection
    let song = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    //find the chosen song in the original data nd mark it false (unavailable)
    for (let i = 0; i < songArray.length; i++) {
        if (songArray[i].title === song.title) {
            songArray[i].available = false;
            break;
        }
    }
    return song;
}

const playSong = (song) => {
    $('#song-data').attr('src', song.path);
    $('audio').get(0).play();
}

$(() => {
    $('#play').on('click', () => {
        const currentSong = selectSong(songList);
        playSong(currentSong);
    })
})
