import { BaseUI } from "./BaseUI";

export class PlaylistUI extends BaseUI {
    constructor(root) {
        super(root);
        this.modalOpenBtn = root.querySelector("#modal-open-btn");
        this.playlistList = root.querySelector(".playlist-list");
    }
}