import { BaseUI } from "./BaseUI";

import { activate } from "../classes/Utils";
import { deactivate } from "../classes/Utils";
import { enable } from "../classes/Utils";
import { disable } from "../classes/Utils";
import { formatAudioDuration } from "../classes/Utils";

export class AllSongsUI extends BaseUI {
    constructor(root) {
        super(root);
        this.deleteModeBtn = root.querySelector(".Header__btn.-delete-mode");
        this.importBtn = root.querySelector(".Header__btn.-import");
        this.fileInput = root.querySelector("#file-input");
        this.searchInput = root.querySelector(".SearchBox__input");
        this.searchClearBtn = root.querySelector(".SearchBox__clear-btn");
        this.songList = root.querySelector(".song-list");

        this.isDeleteMode = false;
    }

    toggleDeleteMode() {
        this.isDeleteMode = !this.isDeleteMode;

        this.showDeleteBtn();
    }

    showDeleteBtn() {
        const deleteBtns = this.root.querySelectorAll(".song-list__delete-btn");

        if (this.isDeleteMode) {
            disable(this.importBtn);
            activate(this.deleteModeBtn);

            deleteBtns.forEach(btn => {
                activate(btn);
            });
        } else {
            enable(this.importBtn);
            deactivate(this.deleteModeBtn);

            deleteBtns.forEach(btn => {
                deactivate(btn);
            });
        }
    }

    getSearchValue() {
        return this.searchInput.value;
    }

    clearSearchValue() {
        this.searchInput.value = "";
    }

    async renderSongList(songs, storage) {
        this.songList.innerHTML = "";

        songs.forEach(song => {
            this.renderSong(song, storage);
        });
    }

    renderSong(song, storage) {
        const items = Array.from(this.songList.querySelectorAll("li"));

        const li = document.createElement('li');
        li.classList.add("song-list__item");
        li.innerHTML = `
            <button class="song-list__delete-btn fa-solid fa-circle-minus"></button>
            <i class="song-list__icon fa-solid fa-music"></i>
            <div class="song-list__info">
                <p class="song-list__title">${song.title}</p>
                <p class="song-list__length">${formatAudioDuration(song.duration)}</p>
            </div>
            <div class="wave">
                <span></span><span></span><span></span><span></span>
            </div>
        `;
        li.dataset.title = song.title;
        li.querySelector(".song-list__delete-btn").addEventListener('click', async (e) => {
            e.stopPropagation();
            await storage.deleteSong(song.path);
            li.classList.add("-deleted");
            setTimeout(() => {li.remove()}, 200);
            this.showDeleteBtn();
        });

        let inserted = false;
        for (const item of items) {
            if (song.title.localeCompare(item.querySelector(".song-list__title").textContent, 'ja') < 0) {
                this.songList.insertBefore(li, item);
                inserted = true;
                break;
            }
        }
        if (!inserted) this.songList.appendChild(li);
    }

    highlightPlayingSong(playingSong) {
        if (!playingSong) return;
        const active = this.songList.querySelector('.song-list__item.active');
        const target = this.songList.querySelector('[data-title="'+playingSong.title+'"]');

        if (active) active.classList.remove("active");
        if (target) target.classList.add("active");
    }

    startWave() {
        const waveSpans = this.root.querySelectorAll(".wave span");
        waveSpans.forEach(span => {
            span.style.animationPlayState = "running";
        });
    }

    stopWave() {
        const waveSpans = this.root.querySelectorAll(".wave span");
        waveSpans.forEach(span => {
            span.style.animationPlayState = "paused";
        });
    }
}