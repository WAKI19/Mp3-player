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
        this.autoScrollText(this.songTitle);
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

    autoScrollText(p, speed = 0.4, pauseDuration = 3000) {
        if (p.scrollWidth <= p.clientWidth) return;

        let direction = 1;
        let pos = p.scrollLeft;
        let paused = false; // ← 停止中かどうかフラグ

        function animate() {
            if (!paused) {
            pos += direction * speed;
            p.scrollLeft = pos;

            // 端まで行ったら反転＋1秒停止
            if (pos + p.clientWidth >= p.scrollWidth || pos <= 0) {
                paused = true;
                direction *= -1; // 向きを反転

                // 1秒後に再開
                setTimeout(() => {
                paused = false;
                requestAnimationFrame(animate);
                }, pauseDuration);
                return; // 一旦アニメーション停止
            }
            }

            requestAnimationFrame(animate);
        }

        setTimeout(() => animate(), pauseDuration);
    }

}