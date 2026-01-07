import { App, Modal } from 'obsidian';
import { CombatView } from 'combat-view';
import DSACombatTracker from './main';
import { Teilnehmer } from 'types';

export class AddPlayerModal extends Modal {
    onSubmit: (teilnehmer: Teilnehmer) => void;

    constructor(app: App, onSubmit: (teilnehmer: Teilnehmer) => void) {
        super(app);
        this.onSubmit = onSubmit; 
    }

    onOpen() {
        let { contentEl } = this;
        
        // Erstellt die Überschrift des Modals 
        contentEl.createEl("h2", {text: "Neuen Teilnehmer hinzufügen"});

        // Eingabefeld Initiative
        let iniInput = contentEl.createEl("input", {
            type: "number",
            placeholder: "Initiative",
            cls: "addTeilnehmerModalInput"
        });
        // Erstellt das Eingabefeld, in das der Name eingetragen werden kann
        let nameInput = contentEl.createEl("input", {
            type: "text",
            placeholder: "Name",
            cls: "addTeilnehmerModalInput"
        });
        // Eingabefeld Leben
        let lebenInput = contentEl.createEl("input", {
            type: "number",
            placeholder: "Leben",
            cls: "addTeilnehmerModalInput"
        });

        // Der save Button, durch den der eingegebene Wert verarbeitet wird
        let saveButton = contentEl.createEl("button", {
            text: "save",
            cls: "addTeilnehmerModalSaveButton",
        });

        saveButton.onclick = () => {
            const neuerTeilnehmer: Teilnehmer = {
                ini: Number(iniInput.value), // Number() hier ggf. noch mit NULL-Check ausstatten?
                name: nameInput.value,
                leben: Number(lebenInput.value) // Number() hier ggf. noch mit NULL-Check ausstatten?
            };

            this.onSubmit(neuerTeilnehmer);
            this.close();
        }
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }

}