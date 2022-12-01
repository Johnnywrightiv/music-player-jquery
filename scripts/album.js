var createSongRow = function (songNumber, songName, songLength) {
  if (songLength >= 60) {
    // var hours = Math.floor(songLength / 3600);
    // to add hours, uncomment hours line and change minutes to = < songLength - hours * 60 >
    var minutes = Math.floor(songLength / 60);
    var seconds = songLength - minutes * 60;
    
    if (seconds < 10) {
      seconds = `0${seconds}`
    };

    songLength = `${minutes}:` + `${seconds}`
  }

  var template =
    '<tr class="album-view-song-item">'
  + '  <td class="song-item-number" style="text-align: center;" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="song-item-title">' + songName + '</td>'
  + '  <td class="song-item-duration">' + songLength + '</td>'
  + '</tr>'
  ;

  var handleSongClick = function() {
    var clickedSongNumber = $(this).attr('data-song-number');

    // 1. There is a song that is currently playing
    if (currentlyPlayingSongNumber !== null) {
      var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');

      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }
  
    // 2. There is a song currently playing, but a different one was clicked to play
    // or this is not a song currently playing
    if (clickedSongNumber !== currentlyPlayingSongNumber) {
      currentlyPlayingSongNumber = clickedSongNumber;

      setSong(songNumber);

      currentSoundFile.play();

      $(this).html(pauseButtonTemplate);
      $mainPlayButton.html(pauseButtonTemplate);
      
      // 3. The currently playing song was clicked
    } else {
      if (currentSoundFile.isPaused()) {
        currentSoundFile.play();
        $(this).html(pauseButtonTemplate);
        $mainPlayButton.html(pauseButtonTemplate);
      } else {
        currentSoundFile.pause();
        $(this).html(playButtonTemplate);
        $mainPlayButton.html(playButtonTemplate);
      }
    }
  };


  var onHover = function () {
    var songItem = $(this).find('.song-item-number');
    var songNumber = songItem.attr('data-song-number');
  
    // if the song being hovered over isn't the one being played
    if (songNumber !== currentlyPlayingSongNumber) {
      // show the play button
      songItem.html(playButtonTemplate);
    }
  };
  
  var offHover = function () {
    var songItem = $(this).find('.song-item-number');
    var songNumber = songItem.attr('data-song-number');
  
    // if the song being hovered over isn't the one being played
    if (songNumber !== currentlyPlayingSongNumber){
      // revert back to just showing the song number
      songItem.html(songNumber);
    }
  };

  var $row = $(template);

  $row.find('.song-item-number').click(handleSongClick);
  $row.hover(onHover, offHover);

  return $row;
};


var setCurrentAlbum = function(album) {
  currentAlbum = album;

  currentSoundFile = new buzz.sound(currentAlbum.songs[songIndex].audioUrl, {
    formats: [ 'mp3' ],
    preload: true
  });

  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $songRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($songRow);

  }

  var handlePlayPauseClick = function () {
    if (currentlyPlayingSongNumber === null) {
      currentlyPlayingSongNumber = 1;
      setSong(currentlyPlayingSongNumber);
    };

    if (currentSoundFile.isPaused()) {
      currentSoundFile.play();
      $(this).html(pauseButtonTemplate);
    } else {
      currentSoundFile.pause();
      $(this).html(playButtonTemplate);
    };
  };

  var handlePrevClick = function () {
    setSong(currentlyPlayingSongNumber);
    
    playbackTime = currentSoundFile.getTime();
    
    if (playbackTime < 0) { // change 0 to 2 or 3 seconds to make restart/previous functionality work... need to use .getTime() to access current play length... likely have to make progress bar work before I can make this functionality work. For now, with 0 in place, it just functions as a previous button (else) and ignores the restart function (if).
      currentlyPlayingSongNumber --;
      setSong(currentlyPlayingSongNumber);
      currentSoundFile.stop();
      currentSoundFile.play();
    } else {
      currentSoundFile.stop();
      currentSoundFile.play();
    };
  };

  var handleNextClick = function () {
    currentlyPlayingSongNumber ++;
    currentSoundFile.stop();
    setSong(currentlyPlayingSongNumber);
    currentSoundFile.play()
  };

  $mainPlayButton.click(handlePlayPauseClick)
  $mainPrevButton.click(handlePrevClick)
  $mainNextButton.click(handleNextClick)
  $volumeSlider.click(getVolumeVal);
};

var setSong = function (songNumber) {
  var $displayCurrentSong = $('.song-name');
  var $displayCurrentArtist = $('.artist-name');
  var $displaySongDuration = $('.total-time')
  if (currentSoundFile) {
    currentSoundFile.stop();
  }

  var songUrl = currentAlbum.songs[currentlyPlayingSongNumber - 1].audioUrl;

  currentSoundFile = new buzz.sound(songUrl, {
    formats: [ 'mp3' ],
    preload: true
  });

  $displayCurrentSong.html(currentAlbum.songs[currentlyPlayingSongNumber - 1].title);
  $displayCurrentArtist.html(currentAlbum.artist);

  songDuration = currentAlbum.songs[currentlyPlayingSongNumber - 1].duration;
  if (songDuration >= 60) {
    var minutes = Math.floor(songDuration / 60);
    var seconds = songDuration - minutes * 60;
    
    if (seconds < 10) {
      seconds = `0${seconds}`
    };
    
    songDuration = `${minutes}:` + `${seconds}`
  }
  $displaySongDuration.html(songDuration);

};

var songIndex = 0;
var $mainPlayButton = $('.play-pause')
var $mainNextButton = $('.next')
var $mainPrevButton = $('.previous')
var $volumeSlider = $('#vol-ctrl')
var $currentTime = $('.current-time')
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

var currentlyPlayingSongNumber = null;
var currentSoundFile = null;
var currentAlbum = null;

setCurrentAlbum(albums[0]);

var getVolumeVal = function() {
  volume = $volumeSlider.val();
  currentSoundFile.setVolume(volume);
};

// Track song progress
// setInterval(() => {
//     playTimeElapsed = currentSoundFile.getTime()
    
//     if (playTimeElapsed >= 60) {
//       var minutes = Math.floor(playTimeElapsed / 60);
//       var seconds = playTimeElapsed - minutes * 60;
      
//       if (seconds < 10) {
//         seconds = `0${seconds}`
//       };
      
//       songDuration = `${minutes}:` + `${seconds}`
//       console.log(songDuration)
//     }
//     $currentTime.html('work plz')
// }, 1000);