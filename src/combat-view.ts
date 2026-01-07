import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { AddPlayerModal  } from 'add-modal';
import DSACombatTracker from './main';
import { Teilnehmer } from './types';

export const VIEW_TYPE_EXAMPLE = 'combat-view';

export class CombatView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
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
    // Neuer Div für Button erstellt, damit beim neu Rendern des Arrays der Button unangetastet bleibt. 
    const saveTeilnehmerButton = container.createEl('div');

    // Anlegen einer Liste von Namen 
    let combatTeilnehmer: Teilnehmer[] = [
      {ini: 15, name: "Alice", leben: 10},
      {ini: 12, name: "Bob", leben: 25},
      {ini: 20, name: "Charlie", leben: 13}
    ];
    
    // Ein neuer Teilnehmer kann durch diesen Button über ein PopUp (Modal) hinzugefügt werden
    let addTeilnehmerButton = saveTeilnehmerButton.createEl('button', {text: 'Add', cls: 'addTeilnehmerButton'});
    addTeilnehmerButton.onclick = (evt: MouseEvent) => {
      new AddPlayerModal(this.app, (neuerTeilnehmer: Teilnehmer) => {
        combatTeilnehmer.push(neuerTeilnehmer);
        teilnehmerCollectionDiv.empty();
        // Alle Reihen aus der combatTeilnehmerliste werden in divs unterteilt
      for (let teilnehmer of combatTeilnehmer) {
        let singleTeilnehmerRow = teilnehmerCollectionDiv.createEl('div', {cls: "teilnehmerViewLayoutSingleRow"});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.ini), cls: "teilnehmerViewAttributes"});
        singleTeilnehmerRow.createEl('div', {text: teilnehmer.name, cls: "teilnehmerViewAttributes"});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.leben), cls: "teilnehmerViewAttributes"});
      }
      }).open();
    };

    // Alle Namen aus der Liste werden zu Anfang angezeigt
    for (let teilnehmer of combatTeilnehmer) {
        let singleTeilnehmerRow = teilnehmerCollectionDiv.createEl('div', {cls: "teilnehmerViewLayoutSingleRow"});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.ini), cls: "teilnehmerViewAttributes"});
        singleTeilnehmerRow.createEl('div', {text: teilnehmer.name, cls: "teilnehmerViewAttributes"});
        singleTeilnehmerRow.createEl('div', {text: String(teilnehmer.leben), cls: "teilnehmerViewAttributes"});
      }

  }

  async onClose() {
    // Nothing to clean up.
  }
}