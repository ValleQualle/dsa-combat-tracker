import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { AddPlayerModal  } from 'add-modal';
import DSACombatTracker from './main';
import { Teilnehmer } from './types';
import { CombatState } from 'combat-state';
import { Teilnehmer } from 'types';

export const VIEW_TYPE_EXAMPLE = 'combat-view';

export class CombatView extends ItemView {
  private state: CombatState; // Die Verbindung zum combat-state file
  
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.state = new CombatState;
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Combat view';
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl('h4', { text: 'Combat view' });

    // Statische Darstellung der in den divs angezeigten Werten
    const ueberschriften = container.createEl('div', {cls: "combatViewUeberschriftenLayout"});
    const ueberschriftIni = ueberschriften.createEl('small', {text: 'Initiative', cls: "combatViewUeberschriftenAttribute"});
    const ueberschriftName = ueberschriften.createEl('small', {text: 'Name', cls: "combatViewUeberschriftenAttribute"});
    const ueberschriftLeben = ueberschriften.createEl('small', {text: 'Leben', cls: "combatViewUeberschriftenAttribute"});

    // Einen div erstellen, in dem alle Attribute angezeigt werden
    const teilnehmerCollectionDiv = container.createEl('div', {cls: "teilnehmerViewLayoutCollectionDiv"});
    
    // Event, durch das die Daten (Doppelklick) geändert werden können
    teilnehmerCollectionDiv.ondblclick = (evt: MouseEvent) => {
      // Merken der initialen Eingabe zur Übergabe an Combat-State
      const currentElement = evt.target as HTMLElement;
      const cell = currentElement.closest(".editable"); // div, der bearbeitet werden soll
      let currentText = cell?.textContent;

      // Umwandlung des geklickten div in input-Feld
      if (cell == null) {
        return;
      } else {
        this.makeEditable(currentElement, cell, currentText);
      }
    };
    // Neuer Div für Button erstellt, damit beim neu Rendern des Arrays der Button unangetastet bleibt. 
    const saveTeilnehmerButton = container.createEl('div');
    // Legt ein vorgefertigtes Array an -> für Dev purposes
    this.state.defaultTeilnehmerArray();
    
    // Ein neuer Teilnehmer kann durch diesen Button über ein PopUp (Modal) hinzugefügt werden
    let addTeilnehmerButton = saveTeilnehmerButton.createEl('button', {text: 'Add', cls: 'addTeilnehmerButton'});
    addTeilnehmerButton.onclick = (evt: MouseEvent) => {
      new AddPlayerModal(this.app, (neuerTeilnehmer: Teilnehmer) => {
        this.state.addTeilnehmer(neuerTeilnehmer);
        // Das Array wird nach ini-Wert sortiert
        //sortArrayIniValue(combatTeilnehmer);
        teilnehmerCollectionDiv.empty();
        // Alle Reihen aus der combatTeilnehmerliste werden in divs unterteilt
      for (let teilnehmer of this.state.getTeilnehmer()) {
        let singleTeilnehmerRow = teilnehmerCollectionDiv.createEl('div', {cls: "teilnehmerViewLayoutSingleRow", attr: {"data-teilnehmer-id": teilnehmer.teilnehmnerId}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.ini), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "ini"}});
        singleTeilnehmerRow.createEl('div', {text: teilnehmer.name, cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "name"}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.leben), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "leben"}});
      }
      }).open();
    };

    // Alle Namen aus der Liste werden zu Anfang angezeigt
    for (let teilnehmer of this.state.getTeilnehmer()) {
        let singleTeilnehmerRow = teilnehmerCollectionDiv.createEl('div', {cls: "teilnehmerViewLayoutSingleRow", attr: {"data-teilnehmer-id": teilnehmer.teilnehmnerId}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.ini), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "ini"}});
        singleTeilnehmerRow.createEl('div', {text: teilnehmer.name, cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "name"}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.leben), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "leben"}});
      }

  }

  async onClose() {
    // Nothing to clean up.
  }

  // Methode, die ein div in ein input-Felt verwandelt.
  makeEditable(currentElement: HTMLElement, cell: Element, currentText: string | null): void {
    cell.empty(); // Feld leeren
    
    const teilnehmerElement = cell.closest(".teilnehmerViewLayoutSingleRow") as HTMLElement;
    const teilnehmerElementId = teilnehmerElement.dataset;

    const input = cell.createEl("input", {
      value: cell.textContent,
      cls: "teilnehmerViewAttributeInput",
    });

    input.focus(); // Wählt das Feld direkt zum Schreiben an

    let commited = false;

    // EventListener zur Entscheidung, ob Eingabe gespeichert oder verworfen werden soll
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancel();
    });

    // Der Fokus auf das angewählte Element geht verloren und die alten Daten und das div 
    // wird wieder angezeigt
    input.addEventListener("blur", () => {
      // Wenn nichts im input steht => Wiederherstellung der letzten Eingabe
      if (input.value.trim() === "") {
        cancel();
      } else { // Wenn ich etwas in input geschrieben habe und blur triggert => save der Eingabe
        save();
      }
    });

    // Die eingegebenen Daten sollen übernommen werden.
    // D.h. in der Datenstruktur der Teilnehmer geändert und im View angezeigt werden.
    const save = () => {
      // Das input Feld wird wieder zu einem div und
      // der eingegebene Wert wird angezeigt
      cell.textContent = input.value;

      // Der neue Wert soll mit in die Teilnehmer Datenstruktur gespeichert werden
      this.state.updateEditedField(currentElement, input.value, teilnehmerElement);

      // Da ini geändert werden kann, muss auch geschaut werden, ob neu sortiert werden muss
      this.state.sortTeilnehmer();
    }

    // Der Text im div wird wieder auf den vorherigen Wert gesetzt
    const cancel = () => {
      cell.textContent = currentText;
    }

  }
}