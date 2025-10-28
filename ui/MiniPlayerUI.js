import { BaseUI } from "./BaseUI";

import { formatAudioDuration } from "../classes/Utils";

export class MiniPlayerUI extends BaseUI {
    constructor(root) {
        super(root);
        this.songTitleElem = root.querySelector(".mini-player__song-title");
        this.songLengthElem = root.querySelector(".mini-player__song-length");
        this.playBtn = root.querySelector(".mini-player__play-btn");
    }

    setup(song) {
        this.songTitleElem.textContent = song.title;
        this.songLengthElem.textContent = formatAudioDuration(song.duration);
    }

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}