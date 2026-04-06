import { ItemView, WorkspaceLeaf, Notice, setIcon } from 'obsidian';
import { AddPlayerModal  } from 'add-modal';
import DSACombatTracker from './main';
import { Teilnehmer } from './types';
import { CombatState } from 'combat-state';

export const VIEW_TYPE_EXAMPLE = 'combat-view';

export class CombatView extends ItemView {
  private state: CombatState; // Die Verbindung zum combat-state file
  private container = this.contentEl;
  // Einen div erstellen, in dem alle Attribute angezeigt werden
  private teilnehmerCollectionDiv!: HTMLElement;
  // Liste aller angezeigten HTMLElemente der Combat-Teilnehmer Liste
  private htmlElementeTeilnehmerListe: HTMLElement[] = [];

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
    this.container.empty();
    this.container.createEl('h4', { text: 'Combat view' });

    // Statische Darstellung der in den divs angezeigten Werten
    const ueberschriften = this.container.createEl('div', {cls: "combatViewUeberschriftenLayout"});
    const ueberschriftIni = ueberschriften.createEl('small', {text: 'Initiative', cls: "combatViewUeberschriftenAttribute"});
    const ueberschriftName = ueberschriften.createEl('small', {text: 'Name', cls: "combatViewUeberschriftenAttribute"});
    const ueberschriftLeben = ueberschriften.createEl('small', {text: 'Leben', cls: "combatViewUeberschriftenAttribute"});
    
    this.teilnehmerCollectionDiv = this.container.createEl('div', {cls: "teilnehmerViewLayoutCollectionDiv"});

    // Event, durch das die Daten (Doppelklick) geändert werden können
    this.teilnehmerCollectionDiv.ondblclick = (evt: MouseEvent) => {
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
    const saveTeilnehmerButton = this.container.createEl('div');
    // Legt ein vorgefertigtes Array an -> für Dev purposes
    // this.state.defaultTeilnehmerArray();

    // Ein neuer Teilnehmer kann durch diesen Button über ein PopUp (Modal) hinzugefügt werden
    let addTeilnehmerButton = saveTeilnehmerButton.createEl('button', {text: 'Add', cls: 'addTeilnehmerButton'});
    addTeilnehmerButton.onclick = (evt: MouseEvent) => {
      new AddPlayerModal(this.app, (neuerTeilnehmer: Teilnehmer) => {
        this.state.addTeilnehmer(neuerTeilnehmer);
        this.teilnehmerCollectionDiv.empty();
      
        this.renderCombatList();
      }).open();
    };
    // Der Play-Button, der den Verlauf des Combats um einen Mitspieler weiter verschiebt.
    let playTeilnehmerButton = saveTeilnehmerButton.createEl('button', {cls: 'addTeilnehmerButton'});
    setIcon(playTeilnehmerButton, 'arrow-big-right-dash');
    playTeilnehmerButton.onclick = (evt: MouseEvent) => {
      // Die background-color des nächsten Eintrages wird auf die highlight-color gesetzt
      // Die background-color des vorherigen Eintrages wird auf none gesetzt
      if (this.state.isCombatTeilnehmerEmpty()) { // Die Liste ist leer
        new Notice("Keine Combat-Teilnehmer");
        return;
      } else {
        new Notice("Combat-Teilnehmer");
        this.state.nextCombatTeilnehmer();
        this.updateHighlight(this.state.getActiveTeilnehmer());
      }
    };
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
      this.renderCombatList();

      // Hinterfrage, ob ich nicht lieber in state sortieren sollte. Dort direkt an der Quelle
      // Da ini geändert werden kann, muss auch geschaut werden, ob neu sortiert werden muss
      //this.state.sortTeilnehmer();
    }

    // Der Text im div wird wieder auf den vorherigen Wert gesetzt
    const cancel = () => {
      cell.textContent = currentText;
    }

  }

  renderCombatList(): void {
    this.teilnehmerCollectionDiv.empty();
    this.htmlElementeTeilnehmerListe = []; // Leert Array zur neuen Befüllung
    // Alle Namen aus der Liste werden zu Anfang angezeigt
    for (let teilnehmer of this.state.getTeilnehmer()) {
        let singleTeilnehmerRow = this.teilnehmerCollectionDiv.createEl('div', {cls: "teilnehmerViewLayoutSingleRow", attr: {"data-teilnehmer-id": teilnehmer.teilnehmnerId}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.ini), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "ini"}});
        singleTeilnehmerRow.createEl('div', {text: teilnehmer.name, cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "name"}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.leben), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "leben"}});
        // Neuer Teilnehmer wird in die HTMLElements Liste aufgenommen
        this.htmlElementeTeilnehmerListe.push(singleTeilnehmerRow);
      }
  }

  updateHighlight(nextID: number): void {
    this.htmlElementeTeilnehmerListe.forEach((el, i) => {
      if (nextID === i) {
        const allChildren = el.children; 
        
        for (let j = 0; j < allChildren.length; j++) {
          const child = allChildren[j] as HTMLElement;
          child.classList.add("highlight");
        }
      } else {
        const allChildren = el.children; 
        
        for (let j = 0; j < allChildren.length; j++) {
          const child = allChildren[j] as HTMLElement;
          child.classList.remove("highlight");
        }
      }
    });
  }
}