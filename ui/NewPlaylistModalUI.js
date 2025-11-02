export class NewPlaylistModalUI {
    constructor() {
        this.root = document.querySelector(".Modal");
        this.closeBtn = this.root.querySelector(".Modal__close-btn");
        this.input = this.root.querySelector(".Modal__input");
        this.createBtn = this.root.querySelector(".Modal__create-btn");
    }

    open() {
        this.root.classList.add("-open");
        this.input.focus();
    }

    close() {
        this.root.classList.remove("-open");
        this.input.value = "";
    }

    activateCreateBtn() {
        this.createBtn.classList.add("-active");
    }

    deactivateCreateBtn() {
        this.createBtn.classList.remove("-active");
    }
}