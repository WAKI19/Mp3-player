import { BaseUI } from "./BaseUI";

export class NewPlaylistModalUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".modal__close-btn");
    }
}