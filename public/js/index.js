const audioPlayer = document.querySelector(".playerBar .audioPlayer audio");

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
  const progress = document.querySelector(
    ".playerBar .audioPlayer .audioPlayer-progress"
  );
  progress.innerHTML = `<p>${formatDuration(elapsed)} / ${formatDuration(
    total
  )}</p>`;
}

function changeThumbnail(url) {
  document
    .querySelector(".playerBar .audioPlayer .audioPlayer-thumbnail")
    .setAttribute("href", url);
  document
    .querySelector(
      ".playerBar .audioPlayer .audioPlayer-thumbnail .audioPlayer-thumbnail-image"
    )
    .setAttribute("src", url);
}

function handleSongLoaded(songId) {
  //Do stuff after song data is loaded
  fetch(`http://localhost:6060/songData?id=${songId}`)
    .then((res) => {
      res.json().then((videoDetails) => {
        const thumbnail_url =
          videoDetails.thumbnails[4]?.url ||
          videoDetails.thumbnails[3]?.url ||
          videoDetails.thumbnails[2]?.url ||
          videoDetails.thumbnails[1]?.url ||
          videoDetails.thumbnails[0]?.url ||
          `http://localhost:6060/images/no_thumbnail.png`;

        changeThumbnail(thumbnail_url);
        audioPlayer.volume = 1;
        document.querySelector(
          ".playerBar .extraControls .extraControls-volumeRange"
        ).value = 100;
        audioPlayer.ontimeupdate = () => {
          setSongDuration(
            Number(audioPlayer.currentTime),
            Number(videoDetails.lengthSeconds)
          );
        };

        document
          .querySelector(".playerBar .audioInfo .audioInfo-title")
          .setAttribute("href", videoDetails.video_url);
        document
          .querySelector(".playerBar .audioInfo .audioInfo-channel")
          .setAttribute("href", videoDetails.ownerProfileUrl);

        document.querySelector(
          ".playerBar .audioInfo .audioInfo-title .audioInfo-title-text"
        ).innerHTML = videoDetails.title;
        document.querySelector(
          ".playerBar .audioInfo .audioInfo-channel .audioInfo-channel-text"
        ).innerHTML = videoDetails.ownerChannelName;
      });
    })
    .catch((err) => {
      console.log(err);
    });

  document
    .querySelector(".playerBar .audioPlayer .audioPlayer-progress")
    .removeAttribute("hidden");
}

audioPlayer.addEventListener("play", () => {
  const playButton = document.querySelector(
    ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-playbackButton"
  );
  document.querySelector(
    ".navBar .navBar-start .navBar-start-brand img"
  ).setAttribute("src", "http://localhost:6060/icons/soundwave_animated.svg");

  playButton.setAttribute("title", "Pause");
  playButton.setAttribute("src", "http://localhost:6060/icons/pause.svg");
});

audioPlayer.addEventListener("pause", () => {
  const pauseButton = document.querySelector(
    ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-playbackButton"
  );
  document.querySelector(
    ".navBar .navBar-start .navBar-start-brand img"
  ).setAttribute("src", "http://localhost:6060/icons/soundwave.svg");

  pauseButton.setAttribute("title", "Play");
  pauseButton.setAttribute("src", "http://localhost:6060/icons/play.svg");
});

const playbackButton = document.querySelector(
  ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-playbackButton"
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
  ".playerBar .extraControls .extraControls-repeat"
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

const volumeSlider = document.querySelector(
  ".playerBar .extraControls .extraControls-volumeRange"
);

volumeSlider.addEventListener("input", (event) => {
  const sliderValue = event.target.value;
  audioPlayer.volume = sliderValue / 100;
});

const volumeButton = document.querySelector(
  ".playerBar .extraControls .extraControls-volume"
);

volumeButton.addEventListener("click", () => {
  if (audioPlayer.volume > 0) {
    volumeSlider.value = 0;
    audioPlayer.volume = 0;
  } else if (audioPlayer.volume === 0) {
    volumeSlider.value = 1 * 100;
    audioPlayer.volume = 1;
  }
});

audioPlayer.onvolumechange = () => {
  if (audioPlayer.volume === 0) {
    volumeButton.setAttribute(
      "src",
      "http://localhost:6060/icons/volume_mute.svg"
    );
  } else if (audioPlayer.volume > 0) {
    volumeButton.setAttribute("src", "http://localhost:6060/icons/volume.svg");
  }
};

const searchBar = document.querySelector(
  ".navBar-start .navBar-start-searchBar"
);
const searchResults = document.querySelector(".searchResults");

document.addEventListener("click", () => {
  if (document.activeElement.className === "navBar-start-searchBar") {
    searchResults.removeAttribute("hidden");
  } else {
    searchResults.setAttribute("hidden", "");
  }
});

searchBar.addEventListener("input", () => {
  const query = searchBar.value;
  fetch(`http://localhost:6060/search?q=${query}`)
    .then(async (res) => {
      let data = await res.json();
      let listItems = ``;
      if (!data.videos) {
        listItems += `<li>${data.message}</li>`;
      }
      data.videos?.forEach((item) => {
        listItems += `<li>${item.title}</li>\n`;
      });

      searchResults.innerHTML = `<ul>${listItems}</ul>`;
    })
    .catch((err) => {
      console.log(err);
    });
});
