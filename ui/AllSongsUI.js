import { StorageManager } from "../classes/StorageManager";

import { BaseUI } from "./BaseUI";

import { activate } from "../classes/Utils";
import { deactivate } from "../classes/Utils";
import { enable } from "../classes/Utils";
import { disable } from "../classes/Utils";
import { findSongIndexByTitle } from "../classes/Utils";

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
        this.renderStop = false;
    }

    toggleDeleteMode() {
        const deleteBtns = this.root.querySelectorAll(".song-list__delete-btn");

        this.isDeleteMode = !this.isDeleteMode;

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
        // 並列でファイルを読み込み
        const songDataList = await Promise.all(
            songs.map(async song => {
            const data = await storage.readFileAsBase64(song.path);
            return { song, data };
            })
        );

        this.songList.innerHTML = "";
        // 全部読み終わってから描画
        for (const { song, data } of songDataList) {
            const index = findSongIndexByTitle(songs, song.title);
            this.addSongToList(song, data, index);
        }
    }

    addSongToList(song, data, index) {
        const li = document.createElement('li');
        li.classList.add("song-list__item");
        li.innerHTML = `
            <button class="song-list__delete-btn fa-solid fa-circle-minus"></button>
            <i class="song-list__icon fa-solid fa-music"></i>
            <div>
            <p class="song-list__title">${song.title}</p>
            <p class="song-list__length">--:--</p>
            </div>
        `;
        li.dataset.index = index;

        // Data URLとしてAudioを生成
        const audio = new Audio(`data:audio/mp3;base64,${data}`);
        audio.addEventListener('loadedmetadata', () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            li.querySelector(".song-list__length").textContent =
            `${minutes}:${seconds.toString().padStart(2, "0")}`;
        });

        this.songList.appendChild(li);
    }
}