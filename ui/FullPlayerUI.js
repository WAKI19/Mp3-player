import { BaseUI } from "./BaseUI";

import { formatAudioDuration } from "../classes/Utils";

export class FullPlayerUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".full-player__close-btn");
        this.songTitleElem = root.querySelector(".full-player__song-title");
        this.currentTimeElem = root.querySelector(".full-player__current-time");
        this.remainingTimeElem = root.querySelector(".full-player__remaining-time");
        this.progressBar = root.querySelector(".full-player__progress-bar");
        this.prevBtn = root.querySelector(".full-player__prev-btn");
        this.playBtn = root.querySelector(".full-player__play-btn");
        this.nextBtn = root.querySelector(".full-player__next-btn");

        this.isDragging = false; //progressBarがドラック中かどうかを判定するフラグ
    }

    setup(song) {
        this.songTitleElem.textContent = song.title;
        this.currentTimeElem.textContent = "0:00";
        this.remainingTimeElem.textContent = formatAudioDuration(song.duration);
        this.progressBar.max = song.duration;
    }

    update(currentTime, duration) {
        if (!this.isDragging) {
            this.currentTimeElem.textContent = formatAudioDuration(currentTime);
            this.remainingTimeElem.textContent = formatAudioDuration(duration - currentTime);

            this.setProgressValue(currentTime);
        }
    }

    updateWhileDragging() {
        this.currentTimeElem.textContent = formatAudioDuration(this.getProgressValue());
        this.remainingTimeElem.textContent = formatAudioDuration(this.progressBar.max - this.getProgressValue());
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

    expansion() {
        this.progressBar.style.transform = "scale(1.03)";
        this.currentTimeElem.style.transform = "scale(1.2)";
        this.remainingTimeElem.style.transform = "scale(1.2)";
    }

    reduction() {
        this.progressBar.style.transform = "scale(1.0)";
        this.currentTimeElem.style.transform = "scale(1.0)";
        this.remainingTimeElem.style.transform = "scale(1.0)";
    }

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}