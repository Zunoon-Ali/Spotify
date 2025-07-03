// console.log('Spotify JS');
let songUl;
let songs = [];
let gana;
let currentSong = new Audio();
let currFolder;

function formatTime(seconds) {
    // Handle cases where the seconds are not available yet
    if (isNaN(seconds) || seconds === Infinity) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60); // Ensure it's an integer

    // Add leading zero if necessary
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }

    // Return formatted time
    return minutes + ":" + remainingSeconds;
}
 

async function getSongs(folder) {
    currFolder = folder;

    let song = await fetch(`/${currFolder}/`);
    let data = await song.text();
    let div = document.createElement("div");
    div.innerHTML = data;
    let td = div.getElementsByTagName("a");

    songs = []; // Clear previous songs
    for (let index = 0; index < td.length; index++) {
        const element = td[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    console.log("Songs loaded:", songs); // Debugging line
    return songs;
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "/assets/pause.svg"; // Set to pause icon
    } else {
        currentSong.pause();
        document.getElementById("play").src = "/assets/play.svg"; // Set to play icon
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = `00:00 / ${formatTime(currentSong.duration)}`;

    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";
    for (const song of gana) {
        // console.log('song', song);

        let cleanSongName = song.replaceAll("%20", " "); // Replace %20 with space

        // Store the actual filename in a data attribute
        songUl.innerHTML += `<li data-track="${song}">
                <img class="invert" src="assets/music.svg" alt="music" />
                <div class="info">
                  <div>${cleanSongName}</div>
                  <div>Zunoon</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class="invert musicIcon" src="/assets/play.svg" alt="play"  />
                </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // Use the actual filename from the data attribute
            playMusic(e.getAttribute('data-track').trim());
        });
    });
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let data = await a.text();

    let div = document.createElement("div");
    div.innerHTML = data;

    let cardContainer = document.querySelector(".card-container"); // Assuming card-container is a class
    cardContainer.innerHTML = "";
    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let data = await a.json();
            // console.log("data", data);

            // Append the new card
            let cardHTML = `
            <div class="card" data-folder="${folder}">
                <div>
                    <img src="/songs/${folder}/cover.jpeg" alt="" />
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>
                <div class="play">
                    <img src="https://img.icons8.com/ios-glyphs/30/play--v1.png" alt="play--v1" />
                </div>
            </div>
        `;
       
            cardContainer.innerHTML += cardHTML;

            cardContainer.addEventListener("click", async (event) => {
                const card = event.target.closest(".card"); // Get the closest card element
                if (card) {
                    const folder = card.dataset.folder; // Get the folder from the clicked card
                    gana = await getSongs(`songs/${folder}`);
                    let songUl = document.querySelector(".songList ul");
                    songUl.innerHTML = ""; // Clear the displayed song list
                    if (gana.length > 0) {
                        playMusic(gana[0], true); // Start playing the first song and update the UI
                    } else {
                        console.warn("No songs found in the selected album.");
                    }
                }
            });

        }
    }
}

async function playSongs() {
    gana = await getSongs("songs/arjit");
    // console.log(gana);
    if (gana.length > 0) {
        playMusic(gana[0], true);
    } else {
        console.warn("No songs found in the initial album.");
    }

    // Display all the albums

    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            document.getElementById("play").src = "/assets/pause.svg";
            currentSong.play();
        } else {
            currentSong.pause();
            document.getElementById("play").src = "/assets/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime) / currentSong.duration * 100 + "%"
    });

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-135%";
    });

    previous.addEventListener("click", () => {
        let currentTrack = currentSong.src.split("/").slice(-1)[0];
        let index = gana.indexOf(currentTrack);
        console.log(gana);
        if ((index - 1) >= 0) {
            playMusic(gana[index - 1]);
        }
    });

    forward.addEventListener("click", () => {
        currentSong.pause();
        let currentTrack = currentSong.src.split("/").slice(-1)[0];
        let index = gana.indexOf(currentTrack);
        if ((index + 1) < gana.length) {
            playMusic(gana[index + 1]);
        }
    });

    // Update volume when range slider is changed
    document.querySelector(".range").addEventListener("input", (e) => {
        const volumeBtn = document.querySelector(".volumeBtn");
        currentSong.volume = e.target.value / 100;

        // Change the volume icon according to the current volume level
        if (currentSong.volume === 0) {
            volumeBtn.src = "/assets/mute.svg";  // Mute icon if volume is 0
            currentSong.muted = true;  // Mute the song if volume is set to 0
        } else if (currentSong.volume <= 0.50) {
            volumeBtn.src = "/assets/volume-50.svg";  // Icon for volume <= 50%
            currentSong.muted = false;
        } else {
            volumeBtn.src = "/assets/volume.svg";  // Full volume icon
            currentSong.muted = false;  // Unmute when volume is set above 0
        }
    });

    // Toggle mute/unmute when volume button is clicked
    document.querySelector(".volumeBtn").addEventListener("click", () => {
        const volumeBtn = document.querySelector(".volumeBtn");

        if (currentSong.muted) {
            currentSong.muted = false;
            volumeBtn.src = "/assets/volume.svg";
        } else {
            currentSong.muted = true;
            volumeBtn.src = "/assets/mute.svg";
        }
    });
}

playSongs();
displayAlbums();
