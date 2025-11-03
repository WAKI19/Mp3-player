import { formatAudioDuration } from "../classes/Utils";

export class MiniPlayerUI {
    constructor() {
        this.root = document.querySelector(".MiniPlayer");
        this.songTitle = this.root.querySelector(".MiniPlayer__song-title");
        this.songLength = this.root.querySelector(".MiniPlayer__song-length");
        this.playBtn = this.root.querySelector(".MiniPlayer__play-btn");
    }

    setup(song) {
        this.songTitle.textContent = song.title;
        this.songLength.textContent = formatAudioDuration(song.duration);
    }

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }

    show() {
        this.root.classList.add("-active");
    }

    hide() {
        this.root.classList.remove("-active");
    }
}