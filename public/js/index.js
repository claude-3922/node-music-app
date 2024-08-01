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

        const songTitle = document.querySelector(
          ".playerBar .audioInfo .audioInfo-title"
        );
        const channelTitle = document.querySelector(
          ".playerBar .audioInfo .audioInfo-channel"
        );

        songTitle.setAttribute("href", videoDetails.video_url);
        songTitle.setAttribute("title", videoDetails.title);
        songTitle.setAttribute("target", "_blank");

        channelTitle.setAttribute("href", videoDetails.ownerProfileUrl);
        channelTitle.setAttribute("title", videoDetails.ownerChannelName);
        channelTitle.setAttribute("target", "_blank");

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

const playbackButton = document.querySelector(
  ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-playbackButton"
);

audioPlayer.addEventListener("play", () => {
  document
    .querySelector(".navBar .navBar-start .navBar-start-brand img")
    .setAttribute("src", "http://localhost:6060/icons/soundwave_animated.svg");

  playbackButton.setAttribute("title", "Pause");
  playbackButton.setAttribute("src", "http://localhost:6060/icons/pause.svg");
});

audioPlayer.addEventListener("pause", () => {
  document
    .querySelector(".navBar .navBar-start .navBar-start-brand img")
    .setAttribute("src", "http://localhost:6060/icons/soundwave.svg");

  playbackButton.setAttribute("title", "Play");
  playbackButton.setAttribute("src", "http://localhost:6060/icons/play.svg");
});

playbackButton.addEventListener("click", () => {
  if (playbackButton.src === "http://localhost:6060/icons/question.svg") {
    return; // very bruteforce way
  }
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
const resultList = document.querySelector(".searchResults .searchResults-list");

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
        console.log("No results found.");
        searchResults.setAttribute(
          "style",
          "margin: 0px; padding: 0px; display: none;"
        );
        return;
      }
      data.videos?.forEach((item) => {
        listItems += `<li>
          <span class='searchResults-list-itemStart'>
            <a target='_blank' href='${item.thumbnail}'> <img src='${item.thumbnail}' height='50' width='50'> </a>
            <p>${item.duration}</p>
          </span>
          <span class='searchResults-list-itemMiddle'>
            <a title='${item.title}'  target='_blank' href='https://www.youtube.com/watch?v=${item.id}'> <h4>${item.title}</h4> </a>
            <a title='${item.channel}' target='_blank' href='${item.channel_url}'> <h6>${item.channel}</h6> </a>
          </span>
          <span class='searchResults-list-buttons'>
            <img id='${item.id}' class='searchResults-list-buttons-play' width='32' height='32' src='http://localhost:6060/icons/play_nofill.svg' onmouseover='this.src=("http://localhost:6060/icons/play_fill.svg")' onmouseout='this.src=("http://localhost:6060/icons/play_nofill.svg")' onclick='playFromSearch(this.id)'>
            <img id='${item.id}' class='searchResults-list-buttons-add' width='32' height='32' src='http://localhost:6060/icons/plus_nofill.svg' onmouseover='this.src=("http://localhost:6060/icons/plus_fill.svg")' onmouseout='this.src=("http://localhost:6060/icons/plus_nofill.svg")' onclick='addToQueue(this.id)'>
          </span>

        </li>\n`;
      });

      searchResults.innerHTML = `<ul class='searchResults-list'>${listItems}</ul>`;
      searchResults.style = "padding:10px; margin:5px;";
    })
    .catch((err) => {
      console.log(err);
    });
});

function addToQueue(songId) {
  const user = "admin";

  fetch(`http://localhost:6060/queue/add/`, {
    method: "POST",
    body: JSON.stringify({ user: user, id: songId }),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (data) => {
      const res = await data.json();
      if (!res.queue) {
        return console.log(`${res.message}`);
      }

      let queue = res.queue;
      let playing = false;

      let now_playing_data = await fetch(
        `http://localhost:6060/queue/now_playing?user=${user}`
      );

      let playingDetails = await now_playing_data.json();

      playing = Object.keys(playingDetails.now_playing).length > 0;
      console.log(playing ? `Currently playing` : `Currently not playing`);

      if (playing === false) {
        playNewSong(queue[0].videoId);
        let newQueue = await fetch(`http://localhost:6060/queue/remove`, {
          method: "POST",
          body: JSON.stringify({ user: user }),
          headers: { "Content-Type": "application/json" },
        });

        let newData = await newQueue.json();
        queue = newData.queue;
      }
      updateQueue(queue);
    })
    .catch((err) => console.log(err));
}

function updateQueue(queue) {
  let listItems = ``;
  if (queue?.length > 0) {
    queue.forEach((song) => {
      listItems += `<li>${song.title}</li>`;
    });
  } else {
    listItems += `<li>No item in queue</li>`;
  }

  document.querySelector(".mainSection ul").innerHTML = `${listItems}`;
}

function playFromSearch(songId) {
  const user = "admin";

  fetch(`http://localhost:6060/queue/now_playing?user=${user}`).then(
    async (npRes) => {
      const npData = await npRes.json();
      const nowPlaying = npData.now_playing;
      console.log(nowPlaying);

      if (Object.keys(nowPlaying).length > 0) {
        const newPrevQueueRes = await fetch(
          `http://localhost:6060/queue/prev/add`,
          {
            method: "POST",
            body: JSON.stringify({ user: user, id: nowPlaying.videoId }),
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(await newPrevQueueRes.json());
      }
    }
  );

  playNewSong(songId);
}

function playNewSong(songId) {
  audioPlayer.setAttribute("src", `http://localhost:6060/play?id=${songId}`);
  audioPlayer.oncanplaythrough = () => handleSongLoaded(songId);
  audioPlayer.type = "audio/webm";
  audioPlayer.load();
}

function playNextFromQueue(user) {
  fetch(`http://localhost:6060/queue?user=${user}`).then(async (data) => {
    const npRes = await fetch(
      `http://localhost:6060/queue/now_playing?user=${user}`
    );
    const npData = await npRes.json();
    const nowPlaying = npData.now_playing;

    const queueData = await data.json();
    let queue = queueData.queue;
    if (queue?.length > 0) {
      const newData = await fetch(`http://localhost:6060/queue/remove`, {
        method: "POST",
        body: JSON.stringify({ user: user }),
        headers: { "Content-Type": "application/json" },
      });
      const newQueueData = await newData.json();
      playNewSong(newQueueData.removed.videoId);

      const newPrevQueueData = await fetch(
        `http://localhost:6060/queue/prev/add/`,
        {
          method: "POST",
          body: JSON.stringify({ user: user, id: nowPlaying.videoId }),
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(await newPrevQueueData.json());

      updateQueue(newQueueData.queue);
    }
  });
}

audioPlayer.onended = () => {
  const user = "admin";

  if (!audioPlayer.loop) {
    playNextFromQueue(user);
  }
};

const skipNextButton = document.querySelector(
  ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-skipEnd"
);

const skipPreviousButton = document.querySelector(
  ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-skipStart"
);

skipNextButton.onclick = () => {
  const user = "admin";

  playNextFromQueue(user);
};

skipPreviousButton.onclick = () => {
  /*
  fetch(`http://localhost:6060/previous_queue?user=${user}`).then(async (data) => {
    const nowPlayingData = await fetch(
      `http://localhost:6060/queue/now_playing?user=${user}`
    );
    const nowPlayingRes = await nowPlayingData.json();
    const nowPlaying = nowPlayingRes.now_playing;

    const prevQueueData = await data.json();
    let prevQueue = prevQueueData.queue;
    if (prevQueue?.length > 0) {
      const newQueueData = await fetch(
        `http://localhost:6060/queue/add/`,
        {
          method: "POST",
          body: JSON.stringify({ user: user, id: nowPlaying.videoId }),
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(await newQueueData.json());
      playNewSong(prevQueue[0].videoId);
      const newPrevQueueRes = await fetch(`http://localhost:6060/previous_queue/remove`, {
        method: "POST",
        body: JSON.stringify({ user: user }),
        headers: { "Content-Type": "application/json" },
      });
      //const newPrevQueueData = await newPrevQueueRes.json();
      //updateQueue(newQueueData.queue);
    }
  });
*/
};
