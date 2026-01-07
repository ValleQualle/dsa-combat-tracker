import { App, Modal } from 'obsidian';

export class AddPlayerModal extends Modal {

    constructor(app: App) {
        super(app);
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.setText("Ich bin ein neues Modal.");
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }

}