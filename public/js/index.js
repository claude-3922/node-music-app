const audioPlayer = document.querySelector(".audioPlayer audio");

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedHrs = hrs > 0 ? `${hrs}:` : "";
  const formattedMins = mins > 0 ? `${mins}:` : "00:";
  const formattedSecs = secs > 0 ? `${secs >= 10 ? secs : "0" + secs}` : "00";

  return `${formattedHrs}${formattedMins}${formattedSecs}`.trim();
}

function setSongDuration(elapsed, total) {
  const progress = document.querySelector(".audioPlayer .audioPlayer-progress");
  progress.innerHTML = `<p>${formatDuration(elapsed)}/${formatDuration(
    total
  )}</p>`;
}

function changeThumbnail(songId) {
  const defaultUrl = "http://localhost:6060/images/no_thumbnail.png";
  fetch(`http://localhost:6060/songData/thumbnail?id=${songId}`)
    .then((res) => {
      res
        .text()
        .then((url) => {
          document
            .querySelector(".audioPlayer-thumbnail")
            .setAttribute("href", url);
          document
            .querySelector(
              ".audioPlayer-thumbnail .audioPlayer-thumbnail-image"
            )
            .setAttribute("src", url);
        })
        .catch((err) => {
          console.log(err);
          setDefaultThumbnail();
        });
    })
    .catch((err) => {
      console.log(err);
      setDefaultThumbnail();
    });

  function setDefaultThumbnail() {
    document
      .querySelector(".audioPlayer-thumbnail")
      .setAttribute("href", defaultUrl);
    document
      .querySelector(".audioPlayer-thumbnail .audioPlayer-thumbnail-image")
      .setAttribute("src", defaultUrl);
  }
}

function handleSongLoaded(songId) {
  //Do stuff after song data is loaded
  fetch(`http://localhost:6060/songData?id=${songId}`)
    .then((res) => {
      res.json().then((videoDetails) => {
        audioPlayer.ontimeupdate = () => {
          setSongDuration(
            Number(audioPlayer.currentTime),
            Number(videoDetails.lengthSeconds)
          );
        };

        document
          .querySelector(".audioInfo .audioInfo-title")
          .setAttribute("href", videoDetails.video_url);
        document
          .querySelector(".audioInfo .audioInfo-channel")
          .setAttribute("href", videoDetails.ownerProfileUrl);

        document.querySelector(
          ".audioInfo .audioInfo-title .audioInfo-title-text"
        ).innerHTML = videoDetails.title;
        document.querySelector(
          ".audioInfo .audioInfo-channel .audioInfo-channel-text"
        ).innerHTML = videoDetails.ownerChannelName;
      });
    })
    .catch((err) => {
      console.log(err);
    });

  changeThumbnail(songId);

  document
    .querySelector(".audioPlayer .audioPlayer-progress")
    .removeAttribute("hidden");
}

audioPlayer.addEventListener("play", () => {
  const playButton = document.querySelector(
    ".audioPlayer .audioPlayer-controls .audioPlayer-controls-playbackButton"
  );

  playButton.setAttribute("title", "Pause");
  playButton.setAttribute("src", "http://localhost:6060/icons/pause.svg");
});

audioPlayer.addEventListener("pause", () => {
  const pauseButton = document.querySelector(
    ".audioPlayer .audioPlayer-controls .audioPlayer-controls-playbackButton"
  );

  pauseButton.setAttribute("title", "Play");
  pauseButton.setAttribute("src", "http://localhost:6060/icons/play.svg");
});

const playbackButton = document.querySelector(
  ".audioPlayer .audioPlayer-controls .audioPlayer-controls-playbackButton"
);

playbackButton.addEventListener("click", () => {
  if (audioPlayer.paused) {
    audioPlayer.dispatchEvent(new Event("play"));
    audioPlayer.play();
  } else if (!audioPlayer.paused) {
    audioPlayer.dispatchEvent(new Event("pause"));
    audioPlayer.pause();
  }
});

const repeatButton = document.querySelector(
  ".audioPlayer .audioPlayer-controls .audioPlayer-controls-repeat"
);

repeatButton.addEventListener("click", () => {
  if (audioPlayer.loop) {
    repeatButton.setAttribute("title", "Turn loop on");
    repeatButton.setAttribute("src", "http://localhost:6060/icons/repeat.svg");
    audioPlayer.loop = false;
  } else if (!audioPlayer.loop) {
    repeatButton.setAttribute("title", "Turn loop off");
    repeatButton.setAttribute(
      "src",
      "http://localhost:6060/icons/repeat_black.svg"
    );
    audioPlayer.loop = true;
  }
});
