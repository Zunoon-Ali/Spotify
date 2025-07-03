// Spotify JS
let songs = [];
let gana = [];
let currentSong = new Audio();
let currFolder;

// Format seconds to MM:SS
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "00:00";
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  if (minutes < 10) minutes = "0" + minutes;
  if (remainingSeconds < 10) remainingSeconds = "0" + remainingSeconds;
  return `${minutes}:${remainingSeconds}`;
}

// Fetch all songs in a folder
async function getSongs(folder) {
  currFolder = folder;
  let song = await fetch(`${currFolder}/`);
  let data = await song.text();
  let div = document.createElement("div");
  div.innerHTML = data;
  let links = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < links.length; index++) {
    const element = links[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${currFolder}/`)[1]);
    }
  }
  console.log("Songs loaded:", songs);
  return songs;
}

// Play selected song
const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "assets/pause.svg";
  } else {
    currentSong.pause();
    document.getElementById("play").src = "assets/play.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = `00:00 / ${formatTime(currentSong.duration)}`;

  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";
  for (const song of gana) {
    let cleanSongName = song.replaceAll("%20", " ");
    songUl.innerHTML += `
      <li data-track="${song}">
        <img class="invert" src="assets/music.svg" alt="music" />
        <div class="info">
          <div>${cleanSongName}</div>
          <div>Zunoon</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert musicIcon" src="assets/play.svg" alt="play" />
        </div>
      </li>
    `;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach(li => {
    li.addEventListener("click", () => {
      playMusic(li.getAttribute("data-track").trim());
    });
  });
}

// Display album cards
async function displayAlbums() {
  let a = await fetch(`songs/`);
  let data = await a.text();
  let div = document.createElement("div");
  div.innerHTML = data;

  let cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = "";
  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`songs/${folder}/info.json`);
      let data = await a.json();

      let cardHTML = `
        <div class="card" data-folder="${folder}">
          <div>
            <img src="songs/${folder}/cover.jpeg" alt="" />
            <h2>${data.title}</h2>
            <p>${data.description}</p>
          </div>
          <div class="play">
            <img src="https://img.icons8.com/ios-glyphs/30/play--v1.png" alt="play" />
          </div>
        </div>
      `;

      cardContainer.innerHTML += cardHTML;

      cardContainer.addEventListener("click", async (event) => {
        const card = event.target.closest(".card");
        if (card) {
          const folder = card.dataset.folder;
          gana = await getSongs(`songs/${folder}`);
          let songUl = document.querySelector(".songList ul");
          songUl.innerHTML = "";
          if (gana.length > 0) {
            playMusic(gana[0], true);
          } else {
            console.warn("No songs found in selected album.");
          }
        }
      });
    }
  }
}

// Play initial songs and bind events
async function playSongs() {
  gana = await getSongs("songs/shub");
  if (gana.length > 0) {
    playMusic(gana[0], true);
  } else {
    console.warn("No songs found in initial album.");
  }

  // Play / Pause toggle
  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.getElementById("play").src = "assets/pause.svg";
    } else {
      currentSong.pause();
      document.getElementById("play").src = "assets/play.svg";
    }
  });

  // Time update & seek bar
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration * 100) + "%";
  });

  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Mobile sidebar
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-135%";
  });

  // Previous / Next
  previous.addEventListener("click", () => {
    let currentTrack = currentSong.src.split("/").slice(-1)[0];
    let index = gana.indexOf(currentTrack);
    if ((index - 1) >= 0) {
      playMusic(gana[index - 1]);
    }
  });
  forward.addEventListener("click", () => {
    let currentTrack = currentSong.src.split("/").slice(-1)[0];
    let index = gana.indexOf(currentTrack);
    if ((index + 1) < gana.length) {
      playMusic(gana[index + 1]);
    }
  });

  // Volume slider
  document.querySelector(".range").addEventListener("input", (e) => {
    const volumeBtn = document.querySelector(".volumeBtn");
    currentSong.volume = e.target.value / 100;

    if (currentSong.volume === 0) {
      volumeBtn.src = "assets/mute.svg";
      currentSong.muted = true;
    } else if (currentSong.volume <= 0.5) {
      volumeBtn.src = "assets/volume-50.svg";
      currentSong.muted = false;
    } else {
      volumeBtn.src = "assets/volume.svg";
      currentSong.muted = false;
    }
  });

  // Volume mute toggle
  document.querySelector(".volumeBtn").addEventListener("click", () => {
    const volumeBtn = document.querySelector(".volumeBtn");
    if (currentSong.muted) {
      currentSong.muted = false;
      volumeBtn.src = "assets/volume.svg";
    } else {
      currentSong.muted = true;
      volumeBtn.src = "assets/mute.svg";
    }
  });
}

playSongs();
displayAlbums();
