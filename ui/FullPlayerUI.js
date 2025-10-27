import { BaseUI } from "./BaseUI";

import { formatAudioDuration } from "../classes/Utils";

export class FullPlayerUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".full-player__close-btn");
        this.songTitleElem = root.querySelector(".full-player__song-title");
        this.songLengthElem = root.querySelector(".full-player__song-length");
        this.progressBar = root.querySelector(".full-player__progress-bar");
        this.prevBtn = root.querySelector(".full-player__prev-btn");
        this.playBtn = root.querySelector(".full-player__play-btn");
        this.nextBtn = root.querySelector(".full-player__next-btn");
    }

    setup(songTitle, songDuration) {
        this.songTitleElem.textContent = songTitle;
        this.songLengthElem.textContent = formatAudioDuration(songDuration);
        this.progressBar.max = songDuration;
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