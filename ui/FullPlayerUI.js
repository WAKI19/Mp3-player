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

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}