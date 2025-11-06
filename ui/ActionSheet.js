export class ActionSheet {
    constructor() {
        this.backdrop = document.querySelector(".ActionSheetBackdrop");
        this.sheet = document.querySelector(".ActionSheet");
        this.actions = this.sheet.querySelector(".ActionSheet__actions");
        this.cancelBtn = this.sheet.querySelector(".ActionSheet__cancel");

        // クリックすると閉じる
        this.backdrop.addEventListener('click', () => {
            this.sheet.classList.remove('-opened');
            this.backdrop.classList.remove('-opened');
        });
    }

    async action(headerText, btns) { //btns [{text: "ボタンのテキスト", value: "value", type: "type"}, {}, {}]
        this.actions.innerHTML = "";

        if (headerText) this.setHeaderText(headerText);
        this.generateBtns(btns);
        this.open();

        const selectedValue = await this.waitInput();
        return selectedValue;
    }

    setHeaderText(text) {
        const p = document.createElement("p");
        p.classList.add("ActionSheet__header-text");
        p.textContent = text;
        p.addEventListener('click', (e) => { e.stopPropagation() }); //headerTextをクリックしてもActionSheetが閉じないようにする

        this.actions.appendChild(p);
    }

    generateBtns(btns) {
        btns.forEach(btn => {
            const btnElem = document.createElement("button");
            btnElem.classList.add("ActionSheet__btn", "ActionSheet__action");
            if (btn.type === "danger") btnElem.classList.add("-danger");
            btnElem.textContent = btn.text;
            btnElem.value = btn.value;

            this.actions.appendChild(btnElem);
        });
    }

    waitInput = () => new Promise((resolve) => {
        this.actions.addEventListener('click', (e) => {
            resolve(e.target.value);
        });
    });

    open() {
        this.backdrop.classList.add("-opened");
        this.sheet.classList.add("-opened");
    }

    close() {
        this.backdrop.classList.remove("-opened");
        this.sheet.classList.remove("-opened");
    }
}