import { BaseUI } from "./BaseUI";

import { activate } from "../classes/Utils";
import { deactivate } from "../classes/Utils";
import { enable } from "../classes/Utils";
import { disable } from "../classes/Utils";
import { formatAudioDuration } from "../classes/Utils";

export class AllSongsUI extends BaseUI {
    constructor(root) {
        super(root);
        this.deleteModeBtn = root.querySelector("#delete-mode-btn");
        this.importBtn = root.querySelector("#import-btn");
        this.fileInput = root.querySelector("#file-input");
        this.searchInput = root.querySelector(".search-box__input");
        this.searchClearBtn = root.querySelector(".search-box__clear-btn");
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
            const li = document.createElement('li');
            li.classList.add("song-list__item");
            li.innerHTML = `
                <button class="song-list__delete-btn fa-solid fa-circle-minus"></button>
                <i class="song-list__icon fa-solid fa-music"></i>
                <div>
                <p class="song-list__title">${song.title}</p>
                <p class="song-list__length">${formatAudioDuration(song.duration)}</p>
                </div>
            `;
            li.dataset.title = song.title;

            this.songList.appendChild(li);
            li.querySelector(".song-list__delete-btn").addEventListener('click', async (e) => {
               e.stopPropagation();
               await storage.deleteSong(song.path);
               this.renderSongList(await storage.loadSongs(), storage);
               this.showDeleteBtn();
            });
        });
    }

    highlightPlayingSong(playingSong) {
        if (!playingSong) return;
        const active = this.songList.querySelector('.song-list__item.active');
        const target = this.songList.querySelector('[data-title="'+playingSong.title+'"]');

        if (active) active.classList.remove("active");
        if (target) target.classList.add("active");
    }
}