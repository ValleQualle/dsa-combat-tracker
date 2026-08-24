import { ItemView, WorkspaceLeaf, Notice, setIcon, setTooltip } from 'obsidian';
import { AddPlayerModal  } from 'modals/add-modal';
import { BooleanChoiceModal } from 'modals/booleanChoice-modal';
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
  // Hält den div, der die Rundennummer hält
  private combatRoundDiv!: HTMLElement;

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
    // Titel der Combat View Seite
    this.container.empty();
    this.container.createEl('h4', { text: 'Combat view' });

    // Button Leiste über der combatList
    const buttonBar = this.container.createEl('div', {cls: 'buttonBarLayout'});
    // Divs zur Aufteilung der ButtonBar (Links, Mitte, Rechts)
    const buttonBarLeftDiv = buttonBar.createEl('div', {cls: 'buttonBarLeft'});
    const buttonBarCenterDiv = buttonBar.createEl('div', {cls: 'buttonBarCenter'});
    const buttonBarRightDiv = buttonBar.createEl('div', {cls: 'buttonBarRight'});
    
    // Legt ein vorgefertigtes Array an -> für Dev purposes
    // this.state.defaultTeilnehmerArray();

    // Der Button, der alle Teilnehmer aus der combatTeilnehmer Liste entfernen lässt
    const removeAllTeilnehmerButton = buttonBarLeftDiv.createEl('button', {cls: 'removeAllTeilnehmerButton'});
    setIcon(removeAllTeilnehmerButton, 'trash-2');
    setTooltip(removeAllTeilnehmerButton, 'Entfernt alle Teilnehmer');
    removeAllTeilnehmerButton.addEventListener("click", () => {
      new BooleanChoiceModal(this.app, (result) => {
        if (result) {
          this.state.removeAllTeilnehmer();
          this.renderCombatList();
          this.renderRoundCounter();
          this.combatRoundDiv.setCssProps({
            "border-color": ""
          });
        }
      }).open();
    });

    // Der Kampfrundenanzeiger
    this.combatRoundDiv = buttonBarCenterDiv.createEl('div', {text: '0', cls: 'combatRoundCounter editable'});
    this.state.on("round-update", () => {
      this.renderRoundCounter();
      this.highlightRoundCounter()
    })

    // Der Play-Button, der den Verlauf des Combats um einen Mitspieler weiter verschiebt.
    let playTeilnehmerButton = buttonBarRightDiv.createEl('button', {cls: 'addTeilnehmerButton'});
    setIcon(playTeilnehmerButton, 'play');
    setTooltip(playTeilnehmerButton, 'Wählt den nächsten Teilnehmer aus');
    playTeilnehmerButton.onclick = (evt: MouseEvent) => {
      if (this.combatRoundDiv.style.borderColor != "") {
        this.combatRoundDiv.setCssProps({
          "border-color": ""
        });
      }
      
      // Die background-color des nächsten Eintrages wird auf die highlight-color gesetzt
      // Die background-color des vorherigen Eintrages wird auf none gesetzt
      if (this.state.isCombatTeilnehmerEmpty()) { // Die Liste ist leer
        new Notice("Noch keine Combat-Teilnehmer");
        return;
      } else {
        this.state.nextCombatTeilnehmer();
        this.updateHighlight(this.state.getActiveTeilnehmerIndex());
      }

      if (this.state.getRoundCounter() == 0) {
        this.state.updateRoundCounter();
        this.renderRoundCounter();
        this.highlightRoundCounter()
      } 
    };

    // Ein neuer Teilnehmer kann durch diesen Button über ein PopUp (Modal) hinzugefügt werden
    let addTeilnehmerButton = buttonBarRightDiv.createEl('button', {cls: 'addTeilnehmerButton'});
    setIcon(addTeilnehmerButton, 'list-plus');
    setTooltip(addTeilnehmerButton, 'Fügt einen neuen Teilnehmer hinzu')
    addTeilnehmerButton.onclick = (evt: MouseEvent) => {
      new AddPlayerModal(this.app, (neuerTeilnehmer: Teilnehmer) => {
        this.state.addTeilnehmer(neuerTeilnehmer);
        this.teilnehmerCollectionDiv.empty();
      
        this.renderCombatList();
      }).open();
    };

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
      let currentText = cell!.textContent;

      // Umwandlung des geklickten div in input-Feld
      if (cell == null) {
        return;
      } else {
        this.makeEditable(currentElement, cell, currentText);
      }
    };

    this.combatRoundDiv.ondblclick = (evt: MouseEvent) => {
      const cell = this.combatRoundDiv.closest(".editable"); // div, der bearbeitet werden soll
      let currentText = cell!.textContent;

      // Umwandlung des geklickten div in input-Feld
      if (cell == null) {
        return;
      } else {
        this.makeEditableRoundCounter(cell, currentText);
      }
    };
  }

  async onClose() {
    // Nothing to clean up.
  }

  // Methode, die ein div in ein input-Felt verwandelt.
  makeEditable(currentElement: HTMLElement, cell: Element, currentText: string | null): void {
    cell.empty(); // Feld leeren
    
    let id = Number(currentElement.parentElement?.getAttribute('data-teilnehmer-id')); // Die TeilnehmerId zum geklickten Feld
    let field = currentElement.getAttribute('data-div-type'); // Das Feld, was angeklickt wurde

    const input = cell.createEl("input", {
      value: cell.textContent ?? undefined,
      cls: "teilnehmerViewAttributeInput",
    });

    input.focus(); // Wählt das Feld direkt zum Schreiben an

    // EventListener zur Entscheidung, ob Eingabe gespeichert oder verworfen werden soll
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancel();
    });

    // Der Fokus auf das angewählte Element geht verloren und die alten Daten und das div 
    // wird wieder angezeigt
    input.addEventListener("blur", () => {
      // Wenn nichts im input steht => Wiederherstellung der letzten Eingabe
        cancel();
    });

    // Die eingegebenen Daten sollen übernommen werden.
    // D.h. in der Datenstruktur der Teilnehmer geändert und im View angezeigt werden.
    const save = () => {
      // Das input Feld wird wieder zu einem div und
      // der eingegebene Wert wird angezeigt
      cell.textContent = input.value;

      // Der neue Wert soll mit in die Teilnehmer Datenstruktur gespeichert werden
      this.state.updateEditedField(field, input.value, id);
      this.renderCombatList();
    }

    // Der Text im div wird wieder auf den vorherigen Wert gesetzt
    const cancel = () => {
      cell.textContent = currentText;
    }

  }
  
  makeEditableRoundCounter(cell: Element, currentRound: string | null): void {
    cell.empty();

    const input = cell.createEl("input", {
      value: cell.textContent ?? undefined,
      cls: "teilnehmerViewAttributeInput",
    });

    // Direktes Anwählen des input Feldes
    input.focus();

    // EventListener zur Entscheidung, ob Eingabe gespeichert oder verworfen werden soll
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { 

        currentRound = input.value;
        
        this.state.updateRoundCounterFromEditedField(Number(currentRound));
        this.renderRoundCounter();
      }
      if (e.key === "Escape") cancel();
    });

    input.addEventListener("blur", () => {
      // Wenn nichts im input steht => Wiederherstellung der letzten Eingabe
        cancel();
    });

    // Der Text im div wird wieder auf den vorherigen Wert gesetzt
    const cancel = () => {
      cell.textContent = currentRound;
    }

  }

  renderCombatList(): void {
    this.teilnehmerCollectionDiv.empty();
    this.htmlElementeTeilnehmerListe = []; // Leert Array zur neuen Befüllung
    // Alle Namen aus der Liste werden zu Anfang angezeigt
    for (let teilnehmer of this.state.getTeilnehmer()) {
        let singleTeilnehmerRow = this.teilnehmerCollectionDiv.createEl('div', {cls: "teilnehmerViewLayoutSingleRow", attr: {"data-teilnehmer-id": teilnehmer.teilnehmerId}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.ini), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "ini"}});
        singleTeilnehmerRow.createEl('div', {text: teilnehmer.name, cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "name"}});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.leben), cls: "teilnehmerViewAttribute editable", attr: {"data-div-type": "leben"}});
        let delButton = singleTeilnehmerRow.createEl('button', {cls: 'removeTeilnehmerButton'});
        delButton.addEventListener("click", () => {
          this.state.removeTeilnehmer(teilnehmer.teilnehmerId);
          this.renderCombatList();
        });
        
        // Neuer Teilnehmer wird in die HTMLElements Liste aufgenommen
        this.htmlElementeTeilnehmerListe.push(singleTeilnehmerRow);
    } 
    this.updateHighlight(this.state.getActiveTeilnehmerIndex());
  }

  // Bekommt den nächsten Teilnehmer aus der Liste und Highlightet diesen
  // alle anderen Einträgen wird das Highlight entzogen
  updateHighlight(nextID: number): void {
    if (this.state.getActiveTeilnehmerIndex() >= 0) {
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

  renderRoundCounter(): void {
    this.combatRoundDiv.setText(String(this.state.getRoundCounter()));
  }

  highlightRoundCounter(): void {
    this.combatRoundDiv.setCssProps({
      "border-color": "#6437cc"
    });
  }
}
