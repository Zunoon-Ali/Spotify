// console.log('Spotify JS');
let songUl
let songs = []
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
    currFolder = folder


    let song = await fetch(`http://127.0.0.1:3000/${currFolder}/`)
    let data = await song.text();
    let div = document.createElement("div");
    div.innerHTML = data;
    let td = div.getElementsByTagName("a");
    // songs = []
    for (let index = 0; index < td.length; index++) {
        const element = td[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
            // ${folder}
        }
    }
    return songs
}
const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;
    // 
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = `00:00 / ${formatTime(currentSong.duration)}`;

    // Update the play button to "pause"
    document.getElementById("play").src = "/assets/play.svg";

    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = ""
    for (const song of gana) {
        let cleanSongName = song
            .replaceAll("%20", " ");                      // Trim any extra spaces

        songUl.innerHTML += `<li>
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
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);z
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

}

async function displayAlbums(){
    
    let song = await fetch(`http://127.0.0.1:3000/${currFolder}/`)
    let data = await song.text();
    let div = document.createElement("div");
    let anchors = div.getElementsByTagName("a");
    div.innerHTML = data;
    Array.from(anchors).forEach(e => {
        // console.log(e.href);
        if(e.href.includes("/songs")){
        console.log(e.href.split("/").slice(-2)[0]);
        
        }
    }) 
}

async function playSongs() {
    // "songs/ncs"
    gana = await getSongs("songs/ncs");
    // console.log(gana);
    playMusic(gana[0], true)

    //display all the albums
    displayAlbums();

    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "/assets/pause.svg";
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
        // console.log(e.offsetX, e.offsetY);

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-135%"

    })

    previous.addEventListener("click", () => {
        let index = gana.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(gana);
        if ((index - 1) >= 0) {
            playMusic(gana[index - 1]);
        }
    })

    forward.addEventListener("click", () => {
        // console.log('Forward Clicked');
        // console.log(currentSong.src);
        currentSong.pause();
        let index = gana.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) > 0 && (index + 1) < gana.length) {
            playMusic(gana[index + 1]);
        }

    })
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
            // Restore the volume icon based on the current volume
        } else {
            currentSong.muted = true;
            volumeBtn.src = "/assets/mute.svg";
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // Clear the existing songs array and UI
            songs = [];  // Clear the songs array
            let songUl = document.querySelector(".songList ul");
            // songUl.innerHTML = "";  // Clear the displayed song list
    
            // Fetch the new album (song list)
            gana = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
            // Play the first song in the new album
            playMusic(gana[0], true);  // Start playing the first song and update the UI
        });
    });
    
    

}


playSongs();
