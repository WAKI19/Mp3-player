import { BaseUI } from "./BaseUI";

export class MiniPlayerUI extends BaseUI {
    constructor(root) {
        super(root);
        this.songTitleElem = root.querySelector(".mini-player__song-title");
        this.songLengthElem = root.querySelector(".mini-player__song-length");
        this.playBtn = root.querySelector(".mini-player__play-btn");
    }

    setup(songTitle, songLength) {
        this.songTitleElem.textContent = songTitle;
        this.songLengthElem.textContent = songLength;
    }

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}