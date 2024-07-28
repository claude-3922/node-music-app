const audioPlayer = document.querySelector(".audioPlayer audio");
const audioControls = document.querySelector(
  ".audioPlayer .audioPlayer-controls"
);

function getSongData(songId) {
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

audioPlayer.addEventListener("play", () => {
  const playButton = document.querySelector(
    ".audioPlayer .audioPlayer-controls .audioPlayer-controls-playbackButton"
  );

  playButton.setAttribute("title", "Pause")
  playButton.setAttribute("src", "http://localhost:6060/icons/pause.svg");
});

audioPlayer.addEventListener("pause", () => {
  const pauseButton = document.querySelector(
    ".audioPlayer .audioPlayer-controls .audioPlayer-controls-playbackButton"
  );

  playButton.setAttribute("title", "Play")
  pauseButton.setAttribute("src", "http://localhost:6060/icons/play.svg");
});


