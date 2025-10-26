import { BaseUI } from "./BaseUI";

export class FullPlayerUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".full-player__close-btn");
        this.songTitleElem = root.querySelector(".full-player__song-title");
        this.songLengthElem = root.querySelector(".full-player__song-length");
        this.progressBar = root.querySelector(".full-player__progress-bar");
        this.playBtn = root.querySelector(".full-player__play-btn");
    }

    setup(songTitle, songLength, duration) {
        this.songTitleElem.textContent = songTitle;
        this.songLengthElem.textContent = songLength;
        this.progressBar.max = duration;
    }

    getProgressValue() {
        return this.progressBar.value;
    }

    setProgressValue(value) {
        this.progressBar.value = value;
        this.updateProgressColor();
    }

    updateProgressColor() {
        const percentage = (this.progressBar.value / this.progressBar.max) * 100 || 0;
        this.progressBar.style.background = `linear-gradient(to right, var(--active-color) ${percentage}%, var(--bg-color) ${percentage}%)`;
    }

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}