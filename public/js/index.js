function changeThumbnail(songId) {
  const defaultUrl = "http://localhost:6060/images/no_thumbnail.png";
  fetch(`http://localhost:6060/songData/thumbnail?id=${songId}`)
    .then((res) => {
      res
        .text()
        .then((url) => {
          document.getElementById("audioPlayer_thumbnail").setAttribute("src", url);
        })
        .catch((err) => {
          console.log(err);
          return defaultUrl;
        });
    })
    .catch((err) => {
      console.log(err);
      return defaultUrl;
    });
}
