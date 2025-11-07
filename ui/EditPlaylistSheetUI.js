import { BaseUI } from "./BaseUI";

import { NotificationUI } from "./NotificationUI";
import { formatAudioDuration } from "../classes/Utils";

const notificationUI = new NotificationUI();

export class EditPlaylistSheetUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".bottom-sheet__close-btn");
        this.searchInput = root.querySelector(".SearchBox__input");
        this.searchClearBtn = root.querySelector(".SearchBox__clear-btn");
        this.songList = root.querySelector(".song-list");
    }

    renderSongs(songs) {
        this.songList.innerHTML = "";

        songs.forEach(song => {
            const li = document.createElement('li');
            li.classList.add("song-list__item");
            li.innerHTML = `
                <i class="song-list__icon drag-handler fa-solid fa-sort"></i>
                <div class="song-list__info">
                    <p class="song-list__title">${song.title}</p>
                    <p class="song-list__length">${formatAudioDuration(song.duration)}</p>
                </div>
                <button class="song-list__remove-btn"><i class="fa-solid fa-circle-minus"></i></button>
            `;
            li.dataset.data = JSON.stringify(song);

            li.querySelector(".song-list__remove-btn").addEventListener('click', async () => {
                li.classList.add("removed");
                setTimeout(() => li.remove(), 250);
                notificationUI.notify(`「${song.title}」を削除しました`, "normal");
            });

            this.songList.appendChild(li);
        });
    }

    returnSongList() {
        const songs = [];
        const items = this.songList.querySelectorAll("li");

        items.forEach(li => {
            const json = JSON.parse(li.dataset.data);
            songs.push(json);
        });

        return songs;
    }

    filterList(keyword) {
        // 入力を小文字にして大小文字を区別しない検索にする
        const query = keyword.toLowerCase();

        // すべての<li>要素を取得
        const items = this.songList.querySelectorAll('li');

        items.forEach(li => {
            const title = JSON.parse(li.dataset.data).title.toLowerCase();
            // キーワードを含むかどうかで表示・非表示を切り替え
            if (title.includes(query)) {
                li.style.display = '';  // 表示
            } else {
                li.style.display = 'none';  // 非表示
            }
        });
    }

    getSearchValue() {
        return this.searchInput.value;
    }
}