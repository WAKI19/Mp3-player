import { BaseUI } from "./BaseUI";

export class NewPlaylistModalUI extends BaseUI {
    constructor(root) {
        super(root);
        this.closeBtn = root.querySelector(".modal__close-btn");
        this.input = root.querySelector(".modal__input");
        this.errorMessage = root.querySelector(".modal__error-message");
        this.createBtn = root.querySelector(".modal__create-btn");
    }

    showErrorMessage(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = "block";
    }

    hideErrorMessage() {
        this.errorMessage.style.display = "none";
    }

}