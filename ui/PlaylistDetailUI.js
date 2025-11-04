import { BaseUI } from "./BaseUI";

import { formatAudioDuration } from "../classes/Utils";
import { calcTotalSongDuration } from "../classes/Utils";

export class PlaylistDetailUI extends BaseUI{
    constructor(root) {
        super(root);
        this.backBtn = root.querySelector(".playlist-detail__back-btn");
        this.header = root.querySelector(".playlist-detail__header");
        this.headerTitle = root.querySelector(".playlist-detail__header .playlist-detail__title");
        this.ellipsisBtn = root.querySelector("#playlist-detail__popover .PopoverList__btn");
        this.popoverPanel = root.querySelector("#playlist-detail__popover .PopoverList__panel");
        this.deleteBtn = root.querySelector("#playlist-detail__delete-btn");
        this.img = root.querySelector(".playlist-detail__img");
        this.length = root.querySelector(".playlist-detail__length");
        this.title = root.querySelector(".playlist-detail__info .playlist-detail__title");
        this.addBtn = root.querySelector(".playlist-detail__action--add");
        this.editBtn = root.querySelector(".playlist-detail__action--edit");
        this.infoBtn = root.querySelector(".playlist-detail__action--info");
        this.playBtn = root.querySelector(".playlist-detail__play-btn");
        this.songList = root.querySelector(".song-list");
    }

    async init(playlist) {
        await this.load(playlist);
        this.renderSongList(playlist.songs);
    }

    async load(playlist) {
        this.root.dataset.id = playlist.id;
        this.headerTitle.textContent = playlist.name;
        this.img.src = playlist.imgBase64Data;
        this.title.textContent = playlist.name;
        this.totalSongDuration = calcTotalSongDuration(playlist.songs);
        this.length.textContent = `${playlist.songs.length}曲、 ${this.formatDuration(this.totalSongDuration)}`;
    }

    renderSongList(songs) {
        this.songList.innerHTML = "";
        
        songs.forEach(song => {
            const li = document.createElement('li');
            li.classList.add("song-list__item");
            li.innerHTML = `
                <i class="song-list__icon fa-solid fa-music"></i>
                <div class="song-list__info">
                    <p class="song-list__title">${song.title}</p>
                    <p class="song-list__length">${formatAudioDuration(song.duration)}</p>
                </div>
            `;
            li.dataset.title = song.title;

            this.songList.appendChild(li);
        })
    };

    setPlayBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }

    setPauseBtn() {
        this.playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    }

    formatDuration(duration) {
        // durationが取得できない場合（まだ読み込み中など）
        if (isNaN(duration)) return null;

        const totalSeconds = Math.floor(duration);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        // 1時間未満なら「○分」だけ表示
        if (hours === 0) {
            return `${minutes}分`;
        }

        return `${hours}時間${minutes}分`;
    }

    loadingPlaylistId() {
        return this.root.dataset.id;
    }
}