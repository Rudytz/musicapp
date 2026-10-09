/* =========================================================
   RUDY MUSIC PLAYER
   FULL APPLICATION LOGIC
========================================================= */

"use strict";


/* =========================================================
   DATA
========================================================= */

const song = {
    id: "come-and-see-me",
    title: "Come and See Me",
    artist: "Rudy",
    duration: 0,
    file: "come-and-see-me.mp3"
};

const songs = [song];


/* =========================================================
   DOM
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const audio = $("#audio");

const playButton = $("#playButton");
const previousButton = $("#previousButton");
const nextButton = $("#nextButton");

const progress = $("#progress");
const volume = $("#volume");

const currentTime = $("#currentTime");
const duration = $("#duration");

const playerTitle = $("#playerTitle");
const playerArtist = $("#playerArtist");

const playerFavorite = $("#playerFavorite");

const loadingScreen = $("#loadingScreen");
const loaderProgress = $("#loaderProgress");


/* =========================================================
   STATE
========================================================= */

const state = {
    currentIndex: 0,

    isPlaying: false,

    shuffle: false,

    repeat: false,

    favorites:
        JSON.parse(
            localStorage.getItem("rudyFavorites") || "[]"
        ),

    playlist:
        JSON.parse(
            localStorage.getItem("rudyPlaylist") || "[]"
        ),

    recent:
        JSON.parse(
            localStorage.getItem("rudyRecent") || "[]"
        ),

    plays:
        Number(
            localStorage.getItem("rudyPlays") || 0
        ),

    listeningSeconds:
        Number(
            localStorage.getItem("rudyListening") || 0
        ),

    activity:
        JSON.parse(
            localStorage.getItem("rudyActivity") ||
            "[]"
        ),

    visualMode: "bars",

    toastTimeout: null
};


/* =========================================================
   SAVE STATE
========================================================= */

function saveState() {

    localStorage.setItem(
        "rudyFavorites",
        JSON.stringify(state.favorites)
    );

    localStorage.setItem(
        "rudyPlaylist",
        JSON.stringify(state.playlist)
    );

    localStorage.setItem(
        "rudyRecent",
        JSON.stringify(state.recent)
    );

    localStorage.setItem(
        "rudyPlays",
        state.plays
    );

    localStorage.setItem(
        "rudyListening",
        state.listeningSeconds
    );

    localStorage.setItem(
        "rudyActivity",
        JSON.stringify(state.activity)
    );
}


/* =========================================================
   LOADING SCREEN
========================================================= */

let loadProgress = 0;

const loadingInterval = setInterval(() => {

    loadProgress += Math.random() * 18;

    if (loadProgress > 100) {
        loadProgress = 100;
    }

    loaderProgress.style.width = `${loadProgress}%`;

    if (loadProgress >= 100) {

        clearInterval(loadingInterval);

        setTimeout(() => {
            loadingScreen.classList.add("hide");
        }, 350);
    }

}, 120);


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const pageNames = {
    home: "HOME",
    library: "LIBRARY",
    favorites: "FAVORITES",
    playlist: "PLAYLIST",
    visualizer: "VISUALIZER",
    stats: "STATISTICS",
    quiz: "QUIZ",
    timeline: "TIMELINE"
};

function openPage(page) {

    $$(".page").forEach(section => {
        section.classList.remove("active");
    });

    const target = $(`#page-${page}`);

    if (!target) {
        return;
    }

    target.classList.add("active");

    $$(".nav-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    $$(".mobile-nav-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    $("#currentPageName").textContent =
        pageNames[page] || page.toUpperCase();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (page === "stats") {
        renderStats();
    }

    if (page === "favorites") {
        renderFavorites();
    }

    if (page === "playlist") {
        renderPlaylist();
    }
}


$$("[data-page]").forEach(button => {

    button.addEventListener("click", () => {

        openPage(button.dataset.page);

    });

});


$$("[data-page-link]").forEach(button => {

    button.addEventListener("click", () => {

        openPage(button.dataset.pageLink);

    });

});


/* =========================================================
   PLAYER
========================================================= */

function loadSong(index = state.currentIndex) {

    state.currentIndex = index;

    const selectedSong = songs[state.currentIndex];

    playerTitle.textContent =
        selectedSong.title;

    playerArtist.textContent =
        selectedSong.artist;

    audio.src = selectedSong.file;

    updateFavoriteButtons();

    updatePlayingCards();

    $("#visualizerStatus").textContent =
        state.isPlaying
            ? "PLAYING"
            : "READY TO PLAY";

}


function playSong(index = state.currentIndex) {

    if (index !== state.currentIndex) {
        loadSong(index);
    }

    audio.play()
        .then(() => {

            state.isPlaying = true;

            updatePlayerUI();

            registerPlay();

        })
        .catch(() => {

            showToast(
                "Audio file missing",
                "Put come-and-see-me.mp3 next to the HTML file."
            );

        });

}


function pauseSong() {

    audio.pause();

    state.isPlaying = false;

    updatePlayerUI();
}


function togglePlay() {

    if (state.isPlaying) {
        pauseSong();
    } else {
        playSong();
    }

}


function previousSong() {

    if (audio.currentTime > 3) {

        audio.currentTime = 0;

        return;
    }

    let index =
        state.currentIndex - 1;

    if (index < 0) {
        index = songs.length - 1;
    }

    loadSong(index);

    playSong(index);
}


function nextSong() {

    let index;

    if (state.shuffle) {

        index =
            Math.floor(
                Math.random() * songs.length
            );

    } else {

        index =
            state.currentIndex + 1;

        if (index >= songs.length) {

            if (state.repeat) {
                index = 0;
            } else {
                index = 0;
            }
        }

    }

    loadSong(index);

    playSong(index);
}


playButton.addEventListener(
    "click",
    togglePlay
);

previousButton.addEventListener(
    "click",
    previousSong
);

nextButton.addEventListener(
    "click",
    nextSong
);

$("#mobilePlay").addEventListener(
    "click",
    togglePlay
);

$("#heroPlay").addEventListener(
    "click",
    togglePlay
);

$("#featuredPlay").addEventListener(
    "click",
    togglePlay
);


/* =========================================================
   PLAYER UI
========================================================= */

function updatePlayerUI() {

    playButton.textContent =
        state.isPlaying
            ? "Ⅱ"
            : "▶";

    $("#mobilePlay").querySelector("span").textContent =
        state.isPlaying
            ? "Ⅱ"
            : "▶";

    $("#featuredPlay").textContent =
        state.isPlaying
            ? "Ⅱ"
            : "▶";

    $("#fullscreenPlay").textContent =
        state.isPlaying
            ? "Ⅱ"
            : "▶";

    $("#visualizerPlaying").textContent =
        state.isPlaying
            ? "PLAYING"
            : "PAUSED";

    $("#visualizerStatus").textContent =
        state.isPlaying
            ? "PLAYING"
            : "READY TO PLAY";

    updatePlayingCards();

}


function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${mins}:${secs}`;
}


audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(audio.duration);

        $("#fullscreenDuration").textContent =
            formatTime(audio.duration);

        song.duration =
            audio.duration;

    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }

        const percentage =
            (audio.currentTime / audio.duration) * 100;

        progress.value =
            percentage;

        $("#fullscreenProgress").value =
            percentage;

        currentTime.textContent =
            formatTime(audio.currentTime);

        $("#fullscreenCurrent").textContent =
            formatTime(audio.currentTime);

    }
);


progress.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }

        audio.currentTime =
            (progress.value / 100) *
            audio.duration;

    }
);


$("#fullscreenProgress").addEventListener(
    "input",
    event => {

        if (!audio.duration) {
            return;
        }

        audio.currentTime =
            (event.target.value / 100) *
            audio.duration;

    }
);


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(volume.value);

    }
);


audio.volume = .8;


audio.addEventListener(
    "ended",
    () => {

        if (state.repeat) {

            audio.currentTime = 0;

            playSong();

        } else {

            nextSong();

        }

    }
);


/* =========================================================
   SHUFFLE / REPEAT
========================================================= */

function toggleShuffle() {

    state.shuffle =
        !state.shuffle;

    $("#shuffleButton").classList.toggle(
        "active",
        state.shuffle
    );

    $("#fullscreenShuffle").classList.toggle(
        "active",
        state.shuffle
    );

    showToast(
        state.shuffle
            ? "Shuffle enabled"
            : "Shuffle disabled",
        state.shuffle
            ? "Songs will play randomly."
            : "Normal playback restored."
    );

}


function toggleRepeat() {

    state.repeat =
        !state.repeat;

    $("#repeatButton").classList.toggle(
        "active",
        state.repeat
    );

    $("#fullscreenRepeat").classList.toggle(
        "active",
        state.repeat
    );

    showToast(
        state.repeat
            ? "Repeat enabled"
            : "Repeat disabled",
        state.repeat
            ? "The playlist will repeat."
            : "Repeat turned off."
    );

}


$("#shuffleButton").addEventListener(
    "click",
    toggleShuffle
);

$("#repeatButton").addEventListener(
    "click",
    toggleRepeat
);

$("#fullscreenShuffle").addEventListener(
    "click",
    toggleShuffle
);

$("#fullscreenRepeat").addEventListener(
    "click",
    toggleRepeat
);

$("#fullscreenPrevious").addEventListener(
    "click",
    previousSong
);

$("#fullscreenNext").addEventListener(
    "click",
    nextSong
);

$("#fullscreenPlay").addEventListener(
    "click",
    togglePlay
);


/* =========================================================
   FULLSCREEN NOW PLAYING
========================================================= */

function openNowPlaying() {

    $("#nowPlaying").classList.add("open");

}


function closeNowPlaying() {

    $("#nowPlaying").classList.remove("open");

}


$("#fullscreenButton").addEventListener(
    "click",
    openNowPlaying
);

$("#playerFullscreen").addEventListener(
    "click",
    openNowPlaying
);

$("#closeNowPlaying").addEventListener(
    "click",
    closeNowPlaying
);


/* =========================================================
   FAVORITES
========================================================= */

function isFavorite(id) {

    return state.favorites.includes(id);

}


function toggleFavorite() {

    const id = song.id;

    if (isFavorite(id)) {

        state.favorites =
            state.favorites.filter(
                favorite => favorite !== id
            );

        showToast(
            "Removed from favorites",
            song.title
        );

    } else {

        state.favorites.push(id);

        showToast(
            "Added to favorites",
            song.title
        );

    }

    saveState();

    updateFavoriteButtons();

    updateStats();

    renderFavorites();

    renderLibrary();

}


function updateFavoriteButtons() {

    const liked =
        isFavorite(song.id);

    [
        playerFavorite,
        $("#featuredFavorite")
    ].forEach(button => {

        button.classList.toggle(
            "liked",
            liked
        );

        button.textContent =
            liked
                ? "♥"
                : "♡";

    });

    $("#favoriteCount").textContent =
        state.favorites.length;

    $("#homeFavorites").textContent =
        state.favorites.length
            .toString()
            .padStart(2, "0");

}


playerFavorite.addEventListener(
    "click",
    toggleFavorite
);

$("#featuredFavorite").addEventListener(
    "click",
    toggleFavorite
);


/* =========================================================
   LIBRARY RENDER
========================================================= */

function createMusicCard(
    track,
    index
) {

    const liked =
        isFavorite(track.id);

    const playing =
        state.isPlaying &&
        index === state.currentIndex;

    return `
        <article
            class="music-card ${playing ? "playing" : ""}"
            data-index="${index}"
        >

            <div class="card-art">

                <span class="card-art-letter">
                    C
                </span>

                <button
                    class="card-favorite ${liked ? "liked" : ""}"
                    data-favorite="${track.id}"
                    title="Favorite"
                >
                    ${liked ? "♥" : "♡"}
                </button>

                <button
                    class="card-play"
                    data-play="${index}"
                    title="Play"
                >
                    ${playing ? "Ⅱ" : "▶"}
                </button>

            </div>

            <div class="card-info">

                <div class="card-title">
                    ${track.title}
                </div>

                <div class="card-artist">
                    ${track.artist}
                </div>

                <div class="card-bottom">

                    <span>
                        SINGLE
                    </span>

                    <button
                        class="add-playlist"
                        data-add="${track.id}"
                        title="Add to playlist"
                    >
                        +
                    </button>

                </div>

            </div>

        </article>
    `;
}


function renderLibrary(
    filter = "all",
    search = ""
) {

    let filtered =
        [...songs];

    if (filter === "favorites") {

        filtered =
            filtered.filter(
                track =>
                    isFavorite(track.id)
            );

    }

    if (filter === "recent") {

        filtered =
            filtered.filter(
                track =>
                    state.recent.includes(track.id)
            );

    }

    if (search.trim()) {

        const query =
            search.toLowerCase();

        filtered =
            filtered.filter(
                track =>
                    track.title
                        .toLowerCase()
                        .includes(query) ||
                    track.artist
                        .toLowerCase()
                        .includes(query)
            );

    }

    $("#libraryGrid").innerHTML =
        filtered
            .map(track => {

                const index =
                    songs.findIndex(
                        s => s.id === track.id
                    );

                return createMusicCard(
                    track,
                    index
                );

            })
            .join("");

    $("#libraryEmpty").classList.toggle(
        "hidden",
        filtered.length > 0
    );

    attachCardEvents();

}


function attachCardEvents() {

    $$("[data-play]").forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const index =
                    Number(
                        button.dataset.play
                    );

                if (
                    index === state.currentIndex &&
                    state.isPlaying
                ) {

                    pauseSong();

                } else {

                    playSong(index);

                }

            }
        );

    });


    $$("[data-favorite]").forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleFavorite();

            }
        );

    });


    $$("[data-add]").forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                addToPlaylist(
                    button.dataset.add
                );

            }
        );

    });

}


$$(".filter").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            $$(".filter").forEach(
                filter =>
                    filter.classList.remove("active")
            );

            button.classList.add("active");

            renderLibrary(
                button.dataset.filter,
                $("#librarySearchInput").value
            );

        }
    );

});


/* =========================================================
   SEARCH
========================================================= */

$("#librarySearch").addEventListener(
    "click",
    () => {

        $("#librarySearchBox")
            .classList.toggle("hidden");

        if (
            !$("#librarySearchBox")
                .classList.contains("hidden")
        ) {

            $("#librarySearchInput").focus();

        }

    }
);


$("#librarySearchInput").addEventListener(
    "input",
    event => {

        const activeFilter =
            $(".filter.active")?.dataset.filter ||
            "all";

        renderLibrary(
            activeFilter,
            event.target.value
        );

    }
);


$("#clearSearch").addEventListener(
    "click",
    () => {

        $("#librarySearchInput").value = "";

        renderLibrary();

        $("#librarySearchInput").focus();

    }
);


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function openSearch() {

    $("#searchModal").classList.add("open");

    setTimeout(() => {
        $("#globalSearch").focus();
    }, 150);

}


function closeSearch() {

    $("#searchModal").classList.remove("open");

}


$("#searchButton").addEventListener(
    "click",
    openSearch
);

$("#searchModal .modal-backdrop").addEventListener(
    "click",
    closeSearch
);

$$("[data-close]").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const modal =
                document.getElementById(
                    button.dataset.close
                );

            modal.classList.remove("open");

        }
    );

});


$("#globalSearch").addEventListener(
    "input",
    event => {

        const query =
            event.target.value
                .trim()
                .toLowerCase();

        if (!query) {

            $("#searchResults").innerHTML = `
                <div class="search-placeholder">
                    Start typing to search your library.
                </div>
            `;

            return;
        }

        const results =
            songs.filter(track =>
                track.title
                    .toLowerCase()
                    .includes(query) ||
                track.artist
                    .toLowerCase()
                    .includes(query)
            );

        if (!results.length) {

            $("#searchResults").innerHTML = `
                <div class="search-placeholder">
                    No results found.
                </div>
            `;

            return;
        }

        $("#searchResults").innerHTML =
            results.map(track => {

                const index =
                    songs.findIndex(
                        item =>
                            item.id === track.id
                    );

                return `
                    <div class="search-result">

                        <div class="search-result-art">
                            C
                        </div>

                        <div class="search-result-info">

                            <strong>
                                ${track.title}
                            </strong>

                            <span>
                                ${track.artist}
                            </span>

                        </div>

                        <button
                            data-search-play="${index}"
                        >
                            ▶
                        </button>

                    </div>
                `;

            }).join("");


        $$("[data-search-play]").forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    playSong(
                        Number(
                            button.dataset.searchPlay
                        )
                    );

                    closeSearch();

                }
            );

        });

    }
);


/* =========================================================
   PLAYLIST
========================================================= */

function addToPlaylist(id) {

    if (
        state.playlist.includes(id)
    ) {

        showToast(
            "Already in playlist",
            song.title
        );

        return;
    }

    state.playlist.push(id);

    saveState();

    renderPlaylist();

    showToast(
        "Added to playlist",
        song.title
    );

}


function removeFromPlaylist(id) {

    state.playlist =
        state.playlist.filter(
            item => item !== id
        );

    saveState();

    renderPlaylist();

}


function renderPlaylist() {

    const list =
        state.playlist
            .map(id =>
                songs.find(
                    track => track.id === id
                )
            )
            .filter(Boolean);

    $("#playlistSongCount").textContent =
        list.length;

    $("#playlistList").innerHTML =
        list.map((track, index) => `

            <div class="track-row">

                <span class="track-number">
                    ${(index + 1)
                        .toString()
                        .padStart(2, "0")}
                </span>

                <div class="track-name">

                    <div class="track-thumb">
                        C
                    </div>

                    <div class="track-text">

                        <strong>
                            ${track.title}
                        </strong>

                        <span>
                            ${track.artist}
                        </span>

                    </div>

                </div>

                <span class="track-duration">
                    ${formatTime(track.duration)}
                </span>

                <button
                    class="track-action"
                    data-remove="${track.id}"
                >
                    ×
                </button>

            </div>

        `).join("");

    $("#playlistEmpty").classList.toggle(
        "hidden",
        list.length > 0
    );


    $$("[data-remove]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                removeFromPlaylist(
                    button.dataset.remove
                );

            }
        );

    });

}


$("#playPlaylist").addEventListener(
    "click",
    () => {

        if (!state.playlist.length) {

            showToast(
                "Playlist is empty",
                "Add a song from the library first."
            );

            return;
        }

        const first =
            songs.findIndex(
                track =>
                    track.id === state.playlist[0]
            );

        playSong(
            first >= 0
                ? first
                : 0
        );

    }
);


/* =========================================================
   RECENTLY PLAYED / STATS
========================================================= */

function registerPlay() {

    const id = song.id;

    state.plays++;

    state.recent =
        [
            id,
            ...state.recent.filter(
                item => item !== id
            )
        ].slice(0, 10);

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    const activityItem =
        state.activity.find(
            item => item.date === today
        );

    if (activityItem) {

        activityItem.plays++;

    } else {

        state.activity.push({
            date: today,
            plays: 1
        });

    }

    saveState();

    updateStats();

}


let listeningTimer = null;

function startListeningTimer() {

    if (listeningTimer) {
        return;
    }

    listeningTimer =
        setInterval(() => {

            if (!state.isPlaying) {
                return;
            }

            state.listeningSeconds++;

            if (
                state.listeningSeconds % 5 === 0
            ) {
                saveState();
            }

            updateStats();

        }, 1000);

}


function updateStats() {

    $("#totalPlays").textContent =
        state.plays
            .toString()
            .padStart(2, "0");

    $("#statsPlays").textContent =
        state.plays;

    $("#statsFavorites").textContent =
        state.favorites.length;

    $("#topTrackPlays").textContent =
        `${state.plays} plays`;

    $("#listeningTime").textContent =
        formatTime(
            state.listeningSeconds
        );

    $("#statsTime").textContent =
        formatTime(
            state.listeningSeconds
        );

    $("#totalSongs").textContent =
        songs.length
            .toString()
            .padStart(2, "0");

    updateFavoriteButtons();

}


function renderStats() {

    updateStats();

    const chart =
        $("#activityChart");

    chart.innerHTML = "";

    const lastDays = [];

    for (
        let i = 13;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        const dateString =
            date
                .toISOString()
                .slice(0, 10);

        const found =
            state.activity.find(
                item =>
                    item.date === dateString
            );

        lastDays.push(
            found
                ? found.plays
                : 0
        );

    }

    const max =
        Math.max(
            ...lastDays,
            1
        );

    lastDays.forEach(value => {

        const bar =
            document.createElement("div");

        bar.className =
            "chart-bar";

        const percentage =
            Math.max(
                5,
                (value / max) * 100
            );

        bar.style.setProperty(
            "--height",
            `${percentage}%`
        );

        bar.title =
            `${value} plays`;

        chart.appendChild(bar);

    });

}


/* =========================================================
   FAVORITES PAGE
========================================================= */

function renderFavorites() {

    const favoriteSongs =
        songs.filter(
            track =>
                isFavorite(track.id)
        );

    $("#favoritesGrid").innerHTML =
        favoriteSongs
            .map(track => {

                const index =
                    songs.findIndex(
                        s =>
                            s.id === track.id
                    );

                return createMusicCard(
                    track,
                    index
                );

            })
            .join("");

    $("#favoritesEmpty")
        .classList.toggle(
            "hidden",
            favoriteSongs.length > 0
        );

    attachCardEvents();

}


/* =========================================================
   VISUALIZER
========================================================= */

const canvas =
    $("#visualizerCanvas");

const ctx =
    canvas.getContext("2d");

let audioContext = null;
let analyser = null;
let sourceNode = null;
let frequencyData = null;
let visualizerReady = false;


function setupAudioVisualizer() {

    if (visualizerReady) {
        return;
    }

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 128;

        sourceNode =
            audioContext.createMediaElementSource(
                audio
            );

        sourceNode.connect(analyser);

        analyser.connect(
            audioContext.destination
        );

        frequencyData =
            new Uint8Array(
                analyser.frequencyBinCount
            );

        visualizerReady = true;

    } catch (error) {

        console.warn(
            "Visualizer unavailable:",
            error
        );

    }

}


audio.addEventListener(
    "play",
    () => {

        setupAudioVisualizer();

        if (
            audioContext &&
            audioContext.state === "suspended"
        ) {

            audioContext.resume();

        }

    }
);


function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    canvas.width =
        rect.width *
        window.devicePixelRatio;

    canvas.height =
        rect.height *
        window.devicePixelRatio;

    ctx.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
    );

}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


function drawVisualizer() {

    requestAnimationFrame(
        drawVisualizer
    );

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (analyser && state.isPlaying) {

        analyser.getByteFrequencyData(
            frequencyData
        );

    } else if (frequencyData) {

        frequencyData =
            frequencyData.map(
                value =>
                    value * .94
            );

    }


    if (state.visualMode === "bars") {

        drawBars(
            width,
            height
        );

    } else if (
        state.visualMode === "wave"
    ) {

        drawWave(
            width,
            height
        );

    } else {

        drawCircle(
            width,
            height
        );

    }

}


function drawBars(
    width,
    height
) {

    if (!frequencyData) {
        drawIdle(width, height);
        return;
    }

    const bars =
        48;

    const gap =
        5;

    const barWidth =
        (width - gap * bars) /
        bars;

    for (
        let i = 0;
        i < bars;
        i++
    ) {

        const dataIndex =
            Math.floor(
                i *
                frequencyData.length /
                bars
            );

        const value =
            frequencyData[dataIndex] || 0;

        const barHeight =
            Math.max(
                3,
                (value / 255) *
                height *
                .65
            );

        const x =
            i *
            (barWidth + gap);

        const y =
            height / 2 -
            barHeight / 2;

        const gradient =
            ctx.createLinearGradient(
                0,
                y,
                0,
                y + barHeight
            );

        gradient.addColorStop(
            0,
            getCss("--accent-light")
        );

        gradient.addColorStop(
            1,
            getCss("--accent-dark")
        );

        ctx.fillStyle =
            gradient;

        roundRect(
            ctx,
            x,
            y,
            barWidth,
            barHeight,
            4
        );

    }

}


function drawWave(
    width,
    height
) {

    if (!frequencyData) {
        drawIdle(width, height);
        return;
    }

    ctx.beginPath();

    const center =
        height / 2;

    const step =
        width /
        frequencyData.length;

    for (
        let i = 0;
        i < frequencyData.length;
        i++
    ) {

        const value =
            frequencyData[i] || 0;

        const amplitude =
            (value / 255) *
            height *
            .3;

        const x =
            i * step;

        const y =
            center +
            Math.sin(i * .45) *
            amplitude;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

    }

    ctx.strokeStyle =
        getCss("--accent-light");

    ctx.lineWidth = 2;

    ctx.shadowBlur = 18;

    ctx.shadowColor =
        getCss("--accent");

    ctx.stroke();

    ctx.shadowBlur = 0;

}


function drawCircle(
    width,
    height
) {

    if (!frequencyData) {
        drawIdle(width, height);
        return;
    }

    const centerX =
        width / 2;

    const centerY =
        height / 2;

    const baseRadius =
        Math.min(width, height) *
        .17;

    const bars =
        90;

    for (
        let i = 0;
        i < bars;
        i++
    ) {

        const dataIndex =
            Math.floor(
                i *
                frequencyData.length /
                bars
            );

        const value =
            frequencyData[dataIndex] || 0;

        const amount =
            (value / 255) *
            100;

        const angle =
            (i / bars) *
            Math.PI *
            2;

        const inner =
            baseRadius;

        const outer =
            baseRadius +
            amount;

        const x1 =
            centerX +
            Math.cos(angle) *
            inner;

        const y1 =
            centerY +
            Math.sin(angle) *
            inner;

        const x2 =
            centerX +
            Math.cos(angle) *
            outer;

        const y2 =
            centerY +
            Math.sin(angle) *
            outer;

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
            getCss("--accent");

        ctx.lineWidth = 2;

        ctx.stroke();

    }

}


function drawIdle(
    width,
    height
) {

    const centerX =
        width / 2;

    const centerY =
        height / 2;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        70,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        getCss("--accent");

    ctx.globalAlpha = .15;

    ctx.lineWidth = 1;

    ctx.stroke();

    ctx.globalAlpha = 1;

}


function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );

    context.beginPath();

    context.moveTo(
        x + r,
        y
    );

    context.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
    );

    context.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
    );

    context.arcTo(
        x,
        y + height,
        x,
        y,
        r
    );

    context.arcTo(
        x,
        y,
        x + width,
        y,
        r
    );

    context.closePath();

    context.fill();

}


function getCss(variable) {

    return getComputedStyle(
        document.body
    ).getPropertyValue(variable);

}


drawVisualizer();


$$(".visual-mode").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            $$(".visual-mode").forEach(
                item =>
                    item.classList.remove("active")
            );

            button.classList.add("active");

            state.visualMode =
                button.dataset.mode;

            $("#visualModeText").textContent =
                button.dataset.mode
                    .toUpperCase();

        }
    );

});


/* =========================================================
   TILT EFFECT
========================================================= */

function setupTilt(element) {

    if (!element) {
        return;
    }

    element.addEventListener(
        "mousemove",
        event => {

            if (
                document.body.classList.contains(
                    "reduced-motion"
                )
            ) {
                return;
            }

            const rect =
                element.getBoundingClientRect();

            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;

            const rotateX =
                ((y / rect.height) - .5) *
                -8;

            const rotateY =
                ((x / rect.width) - .5) *
                8;

            element.style.transform =
                `perspective(800px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 scale(1.015)`;

        }
    );


    element.addEventListener(
        "mouseleave",
        () => {

            element.style.transform =
                "";

        }
    );

}


$$(".tilt-card").forEach(
    setupTilt
);


/* =========================================================
   MOUSE LIGHT
========================================================= */

document.addEventListener(
    "mousemove",
    event => {

        const glow =
            $(".cursor-glow");

        glow.style.left =
            `${event.clientX}px`;

        glow.style.top =
            `${event.clientY}px`;

    }
);


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message
) {

    const toast =
        $("#toast");

    $("#toastTitle").textContent =
        title;

    $("#toastMessage").textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        state.toastTimeout
    );

    state.toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    $("#settingsPanel")
        .classList.add("open");

}


function closeSettings() {

    $("#settingsPanel")
        .classList.remove("open");

}


$("#settingsButton").addEventListener(
    "click",
    openSettings
);

$("#topSettings").addEventListener(
    "click",
    openSettings
);

$("#closeSettings").addEventListener(
    "click",
    closeSettings
);

$(".settings-backdrop").addEventListener(
    "click",
    closeSettings
);


/* =========================================================
   ACCENTS
========================================================= */

$$(".accent").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const accent =
                button.dataset.accent;

            document.body.dataset.accent =
                accent;

            localStorage.setItem(
                "rudyAccent",
                accent
            );

            $$(".accent").forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            button.classList.add(
                "active"
            );

        }
    );

});


const savedAccent =
    localStorage.getItem(
        "rudyAccent"
    );

if (savedAccent) {

    document.body.dataset.accent =
        savedAccent;

    const matching =
        $(`.accent[data-accent="${savedAccent}"]`);

    if (matching) {
        matching.classList.add("active");
    }

}


/* =========================================================
   AMBIENT / PARTICLES / MOTION
========================================================= */

$("#ambientToggle").addEventListener(
    "change",
    event => {

        document
            .querySelectorAll(".ambient")
            .forEach(element => {

                element.style.display =
                    event.target.checked
                        ? ""
                        : "none";

            });

    }
);


$("#particleToggle").addEventListener(
    "change",
    event => {

        $("#particles").style.display =
            event.target.checked
                ? ""
                : "none";

    }
);


$("#motionToggle").addEventListener(
    "change",
    event => {

        document.body.classList.toggle(
            "reduced-motion",
            event.target.checked
        );

        localStorage.setItem(
            "rudyReducedMotion",
            event.target.checked
        );

    }
);


const savedReducedMotion =
    localStorage.getItem(
        "rudyReducedMotion"
    ) === "true";

if (savedReducedMotion) {

    $("#motionToggle").checked =
        true;

    document.body.classList.add(
        "reduced-motion"
    );

}


/* =========================================================
   RESET
========================================================= */

$("#resetData").addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Reset all saved Rudy data?"
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            "rudyFavorites"
        );

        localStorage.removeItem(
            "rudyPlaylist"
        );

        localStorage.removeItem(
            "rudyRecent"
        );

        localStorage.removeItem(
            "rudyPlays"
        );

        localStorage.removeItem(
            "rudyListening"
        );

        localStorage.removeItem(
            "rudyActivity"
        );

        location.reload();

    }
);


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const tag =
            document.activeElement?.tagName;

        const typing =
            tag === "INPUT" ||
            tag === "TEXTAREA";


        if (
            event.code === "Space" &&
            !typing
        ) {

            event.preventDefault();

            togglePlay();

        }


        if (
            event.key === "ArrowLeft" &&
            !typing
        ) {

            previousSong();

        }


        if (
            event.key === "ArrowRight" &&
            !typing
        ) {

            nextSong();

        }


        if (
            event.key.toLowerCase() === "f" &&
            !typing
        ) {

            openNowPlaying();

        }


        if (
            event.key.toLowerCase() === "m" &&
            !typing
        ) {

            audio.muted =
                !audio.muted;

            showToast(
                audio.muted
                    ? "Muted"
                    : "Sound on",
                ""
            );

        }


        if (
            event.key === "Escape"
        ) {

            closeSearch();

            closeSettings();

            closeNowPlaying();

        }


        if (
            (event.ctrlKey ||
             event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            openSearch();

        }

    }
);


/* =========================================================
   QUIZ
========================================================= */

const quizQuestions = [

    {
        question:
            "Which instrument has 88 keys?",

        answers: [
            "Piano",
            "Guitar",
            "Drums",
            "Trumpet"
        ],

        correct: 0
    },

    {
        question:
            "How many strings does a standard guitar have?",

        answers: [
            "4",
            "5",
            "6",
            "8"
        ],

        correct: 2
    },

    {
        question:
            "Which genre is strongly associated with DJs and electronic production?",

        answers: [
            "EDM",
            "Country",
            "Classical",
            "Blues"
        ],

        correct: 0
    },

    {
        question:
            "What does BPM measure in music?",

        answers: [
            "Bass power",
            "Beats per minute",
            "Band performance",
            "Background pitch"
        ],

        correct: 1
    },

    {
        question:
            "Which clef is commonly used for higher-pitched instruments?",

        answers: [
            "Bass clef",
            "Treble clef",
            "Alto clef",
            "Tenor clef"
        ],

        correct: 1
    }

];

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;


function loadQuizQuestion() {

    const question =
        quizQuestions[quizIndex];

    quizAnswered = false;

    $("#quizQuestion").textContent =
        question.question;

    $("#quizProgressText").textContent =
        `QUESTION ${quizIndex + 1} / ${quizQuestions.length}`;

    $("#quizProgressBar").style.width =
        `${((quizIndex + 1) / quizQuestions.length) * 100}%`;

    $("#quizScore").textContent =
        `SCORE ${quizScore}`;

    $("#nextQuestion")
        .classList.add("hidden");

    $("#quizAnswers").innerHTML =
        question.answers
            .map(
                (answer, index) => `
                    <button
                        class="quiz-answer"
                        data-answer="${index}"
                    >
                        ${answer}
                    </button>
                `
            )
            .join("");


    $$(".quiz-answer").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    answerQuestion(
                        Number(
                            button.dataset.answer
                        )
                    );

                }
            );

        }
    );

}


function answerQuestion(answer) {

    if (quizAnswered) {
        return;
    }

    quizAnswered = true;

    const question =
        quizQuestions[quizIndex];

    const buttons =
        $$(".quiz-answer");

    buttons.forEach(
        (button, index) => {

            button.disabled = true;

            if (
                index ===
                question.correct
            ) {

                button.classList.add(
                    "correct"
                );

            }

        }
    );


    if (
        answer === question.correct
    ) {

        quizScore++;

        showToast(
            "Correct",
            "Nice one."
        );

    } else {

        buttons[answer]
            .classList.add("wrong");

        showToast(
            "Not quite",
            "Better luck on the next one."
        );

    }

    $("#quizScore").textContent =
        `SCORE ${quizScore}`;

    $("#nextQuestion")
        .classList.remove("hidden");

}


function nextQuizQuestion() {

    quizIndex++;

    if (
        quizIndex >=
        quizQuestions.length
    ) {

        finishQuiz();

        return;
    }

    loadQuizQuestion();

}


function finishQuiz() {

    $("#quizBox")
        .classList.add("hidden");

    $("#quizResult")
        .classList.remove("hidden");

    $("#finalScore").textContent =
        `${quizScore} / ${quizQuestions.length}`;

    let result;

    if (quizScore === 5) {

        result =
            "Perfect score. You know your music.";

    } else if (quizScore >= 3) {

        result =
            "Pretty solid. You definitely know your stuff.";

    } else {

        result =
            "Good try. Run it again and beat your score.";

    }

    $("#resultText").textContent =
        result;

}


function restartQuiz() {

    quizIndex = 0;

    quizScore = 0;

    $("#quizBox")
        .classList.remove("hidden");

    $("#quizResult")
        .classList.add("hidden");

    loadQuizQuestion();

}


$("#nextQuestion").addEventListener(
    "click",
    nextQuizQuestion
);

$("#restartQuiz").addEventListener(
    "click",
    restartQuiz
);


/* =========================================================
   PARTICLES
========================================================= */

const particleCanvas =
    $("#particles");

const particleCtx =
    particleCanvas.getContext("2d");

let particles = [];

function resizeParticles() {

    particleCanvas.width =
        window.innerWidth *
        window.devicePixelRatio;

    particleCanvas.height =
        window.innerHeight *
        window.devicePixelRatio;

    particleCtx.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
    );

}


function createParticles() {

    particles = [];

    const count =
        Math.min(
            70,
            Math.floor(
                window.innerWidth / 20
            )
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        particles.push({
            x:
                Math.random() *
                window.innerWidth,

            y:
                Math.random() *
                window.innerHeight,

            size:
                Math.random() *
                1.8 +
                .4,

            speed:
                Math.random() *
                .25 +
                .05,

            opacity:
                Math.random() *
                .4 +
                .05
        });

    }

}


function drawParticles() {

    requestAnimationFrame(
        drawParticles
    );

    particleCtx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    if (
        document.body.classList.contains(
            "reduced-motion"
        )
    ) {
        return;
    }

    particles.forEach(
        particle => {

            particle.y -=
                particle.speed;

            if (
                particle.y < -10
            ) {

                particle.y =
                    window.innerHeight + 10;

                particle.x =
                    Math.random() *
                    window.innerWidth;

            }

            particleCtx.beginPath();

            particleCtx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            particleCtx.fillStyle =
                getCss("--accent-light");

            particleCtx.globalAlpha =
                particle.opacity;

            particleCtx.fill();

        }
    );

    particleCtx.globalAlpha = 1;

}


resizeParticles();

createParticles();

drawParticles();

window.addEventListener(
    "resize",
    () => {

        resizeParticles();

        createParticles();

        resizeCanvas();

    }
);


/* =========================================================
   SORT BUTTON
========================================================= */

let sortAscending = true;

$("#sortButton").addEventListener(
    "click",
    () => {

        sortAscending =
            !sortAscending;

        const sorted =
            [...songs].sort(
                (a, b) =>
                    sortAscending
                        ? a.title.localeCompare(
                            b.title
                        )
                        : b.title.localeCompare(
                            a.title
                        )
            );

        $("#libraryGrid").innerHTML =
            sorted
                .map(track => {

                    const index =
                        songs.findIndex(
                            item =>
                                item.id ===
                                track.id
                        );

                    return createMusicCard(
                        track,
                        index
                    );

                })
                .join("");

        attachCardEvents();

    }
);


/* =========================================================
   HOME LIBRARY BUTTON
========================================================= */

$("#heroLibrary").addEventListener(
    "click",
    () => {

        openPage("library");

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

loadSong(0);

renderLibrary();

renderFavorites();

renderPlaylist();

renderStats();

loadQuizQuestion();

updateStats();

startListeningTimer();

showToast(
    "Welcome to Rudy",
    "Your music space is ready."
);