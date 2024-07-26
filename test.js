const ytdl = require("@distube/ytdl-core");

ytdl("http://www.youtube.com/watch?v=aqz-KE-bpKQ").pipe(
  require("fs").createWriteStream("video.mp4")
);
