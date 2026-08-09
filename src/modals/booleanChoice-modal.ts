import { App, Modal, Setting } from 'obsidian';
import { BenchTask } from 'vitest';

export class BooleanChoiceModal extends Modal {

    constructor(app: App, onSubmit: (result: boolean) => void) {
        super(app);
        this.setTitle('Möchtest du die Liste unwiederruflich löschen?')

        new Setting(this.contentEl)
            .addButton((btn) => 
               btn 
                .setButtonText('Ja')
                .setClass('removeAllTeilnehmerButton')
                .onClick(() => {
                    this.close();
                    onSubmit(true);
                }))
            .addButton((btn) => 
               btn 
                .setButtonText('Nein')
                .setClass('addTeilnehmerModalSaveButton')
                .onClick(() => {
                    this.close();
                    onSubmit(false);
                }));
    }
}