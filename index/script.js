
let currentSong = new Audio();
let currfolder;
let songs;
let singer_name="Shubh";

async function getsongs(folder) {

    currfolder = folder;
    let a = await fetch(`/${currfolder}/`); 
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            console.log("element.href=",element.href);
            console.log("element.href.split(`/${folder}/`)[1]=",element.href.split(`/${folder}/`)[1]);
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    console.log("songs=",songs);
    return songs;
}

const playmusic = async (track, pause = false) => {
    // var audio = new Audio("/songs/" + track);
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = `<p>${track.replaceAll("%20", " ")}</p>`;
    document.querySelector(".songtime").innerHTML = `<p>0:00</p>`;

    // show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
                            <img class="invert" src="img/music.svg" alt="music">
                            <div class="info">
                                <h4>${song.replaceAll("%20", " ")}</h4>
                                <p class="singer_name">${singer_name}</p>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="P">
                            </div>
                        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
}
let info;

async function displayAlbums() {

    // Fetch the list of folders in /songs/
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);

    // Clear the card container
    cardcontainer.innerHTML = "";

    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        // Ensure the href is a folder inside /songs/ and not the parent or root
        if (e.href.includes("/songs/") && !e.href.endsWith("/songs/") ) {
            // Extract folder name from the URL
            let folder = e.href.split("/").filter(segment => segment).pop();

            // Skip invalid or unwanted folders (e.g., parent directory)
            if (!folder || folder === "songs") continue;

            let infoResponse = await fetch(`/songs/${folder}/info.json`);
            let response = await infoResponse.json();

                // Append a card to the cardcontainer
            cardcontainer.innerHTML += `
                <div class="card" data-folder="${folder}">
                    <img src="/songs/${folder}/cover.jpg" alt="cover">
                    <div class="info">
                        <h4>${response.tittle}</h4>
                        <p>${response.artist}</p>
                    </div>
                </div>`;
        }
    }

    // load the library whenever clicked on the card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder;
            singer_name=e.querySelector('.info p').innerHTML;
            if (!folder) {
                console.error("data-folder attribute is missing on the clicked card.");
                return;
            }
            songs = await getsongs(`songs/${folder}`);
            currfolder = `songs/${folder}`;
            playmusic(songs[0]);
        })
    })
        
}

async function main() {
    // get the songs from the folder
    songs = await getsongs("songs/shubh");
    playmusic(songs[0], true);
    

    // Display all the albums on the page
    displayAlbums(songs);

    // add event listener for play button
    play.addEventListener("click", element => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    // update the time and progress bar
    currentSong.addEventListener("timeupdate", element => {
        if (isNaN(currentSong.duration)) return;

        if (currentSong.ended) {
            play.src = "img/pause.svg";
            return;
        }

        let currentTime = Math.floor(currentSong.currentTime);
        let duration = Math.floor(currentSong.duration);
        let currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = currentTime % 60;
        let durationMinutes = Math.floor(duration / 60);
        let durationSeconds = duration % 60;

        if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
        if (durationSeconds < 10) durationSeconds = "0" + durationSeconds;

        document.querySelector(".songtime").innerHTML = `<p>${currentMinutes}:${currentSeconds} / ${durationMinutes}:${durationSeconds}</p>`;

        document.querySelector(".circle").style.left = `${(currentTime / duration) * 100}%`;
        document.querySelector(".circle").style.left.backgroundColor = "white";
    })

    document.querySelector(".seekbar").addEventListener("click", element => {
        let seekbar = document.querySelector(".seekbar").getBoundingClientRect();
        let x = element.clientX - seekbar.left;
        let width = seekbar.width;
        let percentage = x / width;
        currentSong.currentTime = percentage * currentSong.duration;
    })

    document.querySelector(".seekbar").addEventListener("mouseleave", element => {
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    })

    // add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // create previous and next buttons
    previous.addEventListener("click", element => {  
        let currentIndex = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);     
        if (currentIndex > 0) {
            playmusic(songs[currentIndex - 1]);
        }
    })

    next.addEventListener("click", element => {
        let currentIndex = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1]);
        if (currentIndex < songs.length - 1) {
            playmusic(songs[currentIndex + 1]);
        }
    })

    // add event listener for volume slider
    document.querySelector(".range").addEventListener("input", element => {
        element.stopPropagation(); // Prevent propagation to avoid muting
        currentSong.volume = element.target.value / 100;
    })

    // add event listener for volume icon to mute/unmute
    document.querySelector(".volume img").addEventListener("click", element => {
        if (currentSong.muted) {
            currentSong.muted = false;
            element.target.src = "img/volume.svg"; // Change back to volume icon   
        } 
        else {
            currentSong.muted = true;
            element.target.src = "img/mute.svg"; // Change to mute icon
        }
    });
 
}

main();