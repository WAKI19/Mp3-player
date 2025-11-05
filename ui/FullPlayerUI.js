import { formatAudioDuration } from "../classes/Utils";

import { AudioVisualizer } from "./AudioVisualizer";

export class FullPlayerUI {
    constructor() {
        this.root = document.querySelector(".FullPlayer");
        this.closeBtn = this.root.querySelector(".FullPlayer__close-btn");
        this.Record = this.root.querySelector(".FullPlayer__record");
        this.songTitleElem = this.root.querySelector(".FullPlayer__song-title");
        this.currentTimeElem = this.root.querySelector(".FullPlayer__current-time");
        this.remainingTimeElem = this.root.querySelector(".FullPlayer__remaining-time");
        this.progressBar = this.root.querySelector(".FullPlayer__progress-bar");
        this.prevBtn = this.root.querySelector(".FullPlayer__prev-btn");
        this.playBtn = this.root.querySelector(".FullPlayer__play-btn");
        this.nextBtn = this.root.querySelector(".FullPlayer__next-btn");

        this.visualCanvas = this.root.querySelector("#vCanvas");
        this.audioVisualizer = new AudioVisualizer(this.visualCanvas, this.Record);

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
        this.progressBar.style.background = `linear-gradient(to right, rgb(var(--main-color)) 0%, rgb(var(--white)) ${percentage}%, rgb(var(--dark-gray)) ${percentage}%)`;
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

    startRecordAnimation() {
        this.Record.style.animationPlayState = "running";
    }

    stopRecordAnimation() {
        this.Record.style.animationPlayState = "paused";
    }

    open() {
        this.root.classList.add("-opened");
    }

    close() {
        this.root.classList.remove("-opened");
    }
}