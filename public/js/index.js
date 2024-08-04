const audioPlayer = document.querySelector(".playerBar .audioPlayer audio");

function updateQueue(queue) {
  let listItems = ``;
  if (queue?.length > 0) {
    let i = 1;
    queue.forEach((song) => {
      const thumbnail =
        song.thumbnails[4]?.url ||
        song.thumbnails[3]?.url ||
        song.thumbnails[2]?.url ||
        song.thumbnails[1]?.url ||
        song.thumbnails[0]?.url ||
        `/images/no_thumbnail.png`;
      listItems += `<li>
        <span class="queueItem-info">
          <span class="queueItem-index">${i}</span>
          <span class="queueItem-start">
            <img height="56" width="56" src="${thumbnail}">
            <p>${formatDuration(song.lengthSeconds)}</p>
          </span>
          <span class="queueItem-middle">
            <a href="${song.video_url}">
              <h4>${song.title}</h4>
            </a>
            <a href="${song.ownerProfileUrl}">
              <h6>${song.ownerChannelName}</h6>
            </a>
          </span>
        </span>
        
        <span class="queueItem-end">
          <img
          id="${i - 1}"
          height="40" 
          width="40" 
          src="/icons/trash_nofill.svg"
          onmouseover="this.src=('/icons/trash_fill.svg');"
          onmouseout="this.src=('/icons/trash_nofill.svg');"
          onclick="deleteFromQueue(this.id);"
          >
          <img 
          id="${i - 1}"
          height="32"
          width="32" 
          src="/icons/play_nofill.svg"
          onmouseover="this.src=('/icons/play_fill.svg');"
          onmouseout="this.src=('/icons/play_nofill.svg');"
          onclick="playFromQueue(this.id);"
          >
        </span>
      </li>`;
      i++;
    });
  } else {
    listItems += `<li style="padding-left: 16px;">No item in queue</li>`;
  }

  document.querySelector(".mainSection ul").innerHTML = `${listItems}`;
}

window.onload = () => {
  const nowPlaying_id = localStorage.getItem("now_playing_id");
  if (nowPlaying_id !== null) {
    audioPlayer.setAttribute(
      "src",
      `/play?id=${nowPlaying_id}`
    );
    audioPlayer.oncanplaythrough = () => handleSongLoaded(nowPlaying_id);
    audioPlayer.load();
  }

  localStorage.setItem("prev_queue", "[]");

  updateQueue(JSON.parse(localStorage.getItem("queue" || "[]")));
};

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
  fetch(`/songData?id=${songId}`)
    .then((res) => {
      res.json().then((videoDetails) => {
        localStorage.setItem("now_playing", JSON.stringify(videoDetails));
        localStorage.setItem("now_playing_id", songId);

        const thumbnail_url =
          videoDetails.thumbnails[4]?.url ||
          videoDetails.thumbnails[3]?.url ||
          videoDetails.thumbnails[2]?.url ||
          videoDetails.thumbnails[1]?.url ||
          videoDetails.thumbnails[0]?.url ||
          `/images/no_thumbnail.png`;

        changeThumbnail(thumbnail_url);
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
    .setAttribute("src", "/icons/soundwave_animated.svg");

  playbackButton.setAttribute("title", "Pause");
  playbackButton.setAttribute("src", "/icons/pause.svg");
});

audioPlayer.addEventListener("pause", () => {
  document
    .querySelector(".navBar .navBar-start .navBar-start-brand img")
    .setAttribute("src", "/icons/soundwave.svg");

  playbackButton.setAttribute("title", "Play");
  playbackButton.setAttribute("src", "/icons/play.svg");
});

playbackButton.addEventListener("click", () => {
  if (audioPlayer.currentSrc === "") {
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
    repeatButton.setAttribute("src", "/icons/repeat.svg");
    audioPlayer.loop = false;
  } else if (!audioPlayer.loop) {
    repeatButton.setAttribute("title", "Turn loop off");
    repeatButton.setAttribute(
      "src",
      "/icons/repeat_black.svg"
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
  localStorage.setItem("volume", sliderValue / 100);
});

const volumeButton = document.querySelector(
  ".playerBar .extraControls .extraControls-volume"
);

volumeButton.addEventListener("click", () => {
  if (audioPlayer.volume > 0) {
    volumeSlider.value = 0;
    audioPlayer.volume = 0;
    localStorage.setItem("volume", 0);
  } else if (audioPlayer.volume === 0) {
    volumeSlider.value = 1 * 100;
    audioPlayer.volume = 1;
    localStorage.setItem("volume", 1);
  }
});

audioPlayer.onvolumechange = () => {
  if (audioPlayer.volume === 0) {
    volumeButton.setAttribute(
      "src",
      "/icons/volume_mute.svg"
    );
  } else if (audioPlayer.volume > 0) {
    volumeButton.setAttribute("src", "/icons/volume.svg");
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
    searchBar.value = "";
    searchResults.innerHTML = `<ul class='searchResults-list'></ul>`;
    searchResults.style = "padding:0px; margin:0px; display: none;";
    searchResults.setAttribute("hidden", "");
  }
});

searchBar.addEventListener("input", () => {
  const query = searchBar.value;
  fetch(`/search?q=${query}`)
    .then(async (res) => {
      let data = await res.json();
      let listItems = ``;
      if (!data.videos) {
        console.log("No results found.");
        searchResults.style = "padding:0px; margin:0px; display: none;";
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
            <img id='${item.id}' class='searchResults-list-buttons-play' width='32' height='32' src='/icons/play_nofill.svg' onmouseover='this.src=("/icons/play_fill.svg")' onmouseout='this.src=("/icons/play_nofill.svg")' onclick='playFromSearch(this.id)'>
            <img id='${item.id}' class='searchResults-list-buttons-add' width='32' height='32' src='/icons/plus_nofill.svg' onmouseover='this.src=("/icons/plus_fill.svg")' onmouseout='this.src=("/icons/plus_nofill.svg")' onclick='addToQueue(this.id)'>
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
  //const user = "admin";
  fetch(`/songData?id=${songId}`)
    .then(async (res) => {
      const data = await res.json();
      let songData = data;

      const queue = JSON.parse(localStorage.getItem("queue") || "[]");
      queue.push(songData);

      localStorage.setItem("queue", JSON.stringify(queue));
      if (localStorage.getItem("now_playing_id") === null) {
        const songToPlay = queue.shift();
        playNewSong(songToPlay.videoId);
        localStorage.setItem("queue", JSON.stringify(queue));
      }
      updateQueue(queue);
    })
    .catch((err) => console.log(err));
}

function playFromSearch(songId) {
  const now_playing_id = localStorage.getItem("now_playing_id");

  if (now_playing_id !== null) {
    const prevQueue = JSON.parse(localStorage.getItem("prev_queue") || "[]");
    const songData = JSON.parse(localStorage.getItem("now_playing"));
    prevQueue.push(songData);
    localStorage.setItem("prev_queue", JSON.stringify(prevQueue));
  }

  playNewSong(songId);
}

function playNewSong(songId) {
  audioPlayer.setAttribute("src", `/play?id=${songId}`);
  audioPlayer.volume = localStorage.getItem("volume") || 1;
  document.querySelector(
    ".playerBar .extraControls .extraControls-volumeRange"
  ).value = localStorage.getItem("volume") * 100 || 1 * 100;
  audioPlayer.oncanplaythrough = () => handleSongLoaded(songId);
  audioPlayer.load();
}

function playNextFromQueue() {
  let now_playing_id = localStorage.getItem("now_playing_id");
  let now_playing = JSON.parse(localStorage.getItem("now_playing"));
  let queue = JSON.parse(localStorage.getItem("queue") || "[]");
  let prev_queue = JSON.parse(localStorage.getItem("prev_queue") || "[]");
  if (queue.length === 0) {
    return;
  } else {
    if (now_playing_id !== null) {
      prev_queue.push(now_playing);
    }
    playNewSong(queue[0].videoId);
    queue.shift();
  }
  localStorage.setItem("queue", JSON.stringify(queue));
  localStorage.setItem("prev_queue", JSON.stringify(prev_queue));

  updateQueue(queue);
}

audioPlayer.onended = () => {
  //const user = "admin";

  if (!audioPlayer.loop) {
    playNextFromQueue();
  }
};

const skipNextButton = document.querySelector(
  ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-skipEnd"
);

const skipPreviousButton = document.querySelector(
  ".playerBar .audioInfo .audioInfo-controls .audioInfo-controls-skipStart"
);

skipNextButton.onclick = () => {
  playNextFromQueue();
};

skipPreviousButton.onclick = () => {
  const prev_queue = JSON.parse(localStorage.getItem("prev_queue") || "[]");
  const queue = JSON.parse(localStorage.getItem("queue") || "[]");
  const now_playing = JSON.parse(localStorage.getItem("now_playing"));
  if (prev_queue.length === 0) {
    audioPlayer.currentTime = 1;
    return;
  }

  queue.unshift(now_playing);

  playNewSong(prev_queue[prev_queue.length - 1].videoId);

  prev_queue.pop();
  console.log(queue);
  updateQueue(queue);
  localStorage.setItem("prev_queue", JSON.stringify(prev_queue));
  localStorage.setItem("queue", JSON.stringify(queue));
};

function deleteFromQueue(songIndex) {
  const queue = JSON.parse(localStorage.getItem("queue") || "[]");
  if (queue.length === 0 || songIndex > queue.length - 1) {
    return;
  }
  queue.splice(songIndex, 1);
  localStorage.setItem("queue", JSON.stringify(queue));
  updateQueue(queue);
}

function playFromQueue(songIndex) {
  const queue = JSON.parse(localStorage.getItem("queue") || "[]");
  const prev_queue = [];
  const now_playing = JSON.parse(localStorage.getItem("now_playing"));
  if (queue.length === 0 || songIndex > queue.length - 1) {
    return;
  }

  prev_queue.push(now_playing);
  playNewSong(queue[songIndex].videoId);
  queue.splice(0, songIndex).forEach((item) => prev_queue.push(item));
  queue.shift();

  updateQueue(queue);

  localStorage.setItem("prev_queue", JSON.stringify(prev_queue));
  localStorage.setItem("queue", JSON.stringify(queue));
}
