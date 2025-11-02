export class Notification {
    constructor(text) {
        this.body = document.querySelector(".Notification");
        this.textarea = this.body.querySelector(".Notification__textarea");

        this.textarea.innerText = text;
        this.show();
    }

    show() {
        this.body.classList.add("-active");
        setTimeout(() => {
            this.body.classList.remove("-active");
        }, 3000);
    }
}