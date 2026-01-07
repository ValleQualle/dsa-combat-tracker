import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';

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

    // Einen div erstellen, in dem ein Name angezeigt wird
    const teilnehmerDiv = container.createEl('div');
    
    // Ein neuer Teilnehmer kann durch diesen Button über ein PopUp (Modal) hinzugefügt werden
    let addTeilnehmerButton = teilnehmerDiv.createEl('button', {text: 'Add', cls: 'addTeilnehmerButton'});
    addTeilnehmerButton.onclick = (evt: MouseEvent) => {
      
    }

    // Anlegen einer Liste von Namen 
    let combatTeilnehmer: string[] = ["Anna", "Bob", "Charlie"];

    // Alle Namen aus der Liste werden angezeigt
    for (let i of combatTeilnehmer) {
      teilnehmerDiv.createEl('small', {text: i, cls: 'teilnehmerDiv'});
    }

  }

  async onClose() {
    // Nothing to clean up.
  }
}