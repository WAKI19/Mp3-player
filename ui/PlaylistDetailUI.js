import { BaseUI } from "./BaseUI";

export class PlaylistDetailUI extends BaseUI{
    constructor(root) {
        super(root);
        this.backBtn = root.querySelector(".playlist-detail__back-btn");
        this.header = root.querySelector(".playlist-detail__header");
        this.headerTitle = root.querySelector(".playlist-detail__header .playlist-detail__title");
        this.ellipsisBtn = root.querySelector("#playlist-detail__popover .popover__btn");
        this.popoverPanel = root.querySelector("#playlist-detail__popover .popover__panel");
        this.deleteBtn = root.querySelector("#playlist-detail__delete-btn");
        this.img = root.querySelector(".playlist-detail__img");
        this.length = root.querySelector(".playlist-detail__length");
        this.title = root.querySelector(".playlist-detail__info .playlist-detail__title");
        this.addBtn = root.querySelector(".playlist-detail__action--add");
        this.editBtn = root.querySelector(".playlist-detail__action--edit");
        this.infoBtn = root.querySelector(".playlist-detail__action--info");
        this.songList = root.querySelector(".song-list");
    }

    async load(playlist) {
        this.root.dataset.id = playlist.id;
        this.headerTitle.textContent = playlist.name;
        this.img.src = playlist.imgBase64Data;
        this.title.textContent = playlist.name;
        this.length.textContent = `${playlist.songs.length}曲、 -時間--分`;
    }

    renderSongList(songs) {
        this.songList.innerHTML = "";
        
        songs.forEach(song => {
            const li = document.createElement('li');
            li.classList.add("song-list__item");
            li.innerHTML = `
                <i class="song-list__icon fa-solid fa-music"></i>
                <div>
                    <p class="song-list__title">${song.title}</p>
                    <p class="song-list__length">${song.duration}</p>
                </div>
            `;
            li.dataset.title = song.title;

            this.songList.appendChild(li);
        })
    };

    loadingPlaylistId() {
        return this.root.dataset.id;
    }
}