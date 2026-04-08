import { Teilnehmer } from './types';
import { Notice } from 'obsidian';

export class CombatState { // Erbt von nichts, da kein View oder Plugin
    private combatTeilnehmer: Teilnehmer[] = [];
    private globalTeilnehmerCount: number = 0;
    private activeTeilnehmer: number = -1; // Der Index des Teilnehmers, der gerade gehighlightet ist
    
    defaultTeilnehmerArray(): void {
        this.combatTeilnehmer.push({teilnehmnerId: 1, ini: 15, name: "Alice", leben: 10});
        this.combatTeilnehmer.push({teilnehmnerId: 2, ini: 12, name: "Bob", leben: 25});
        this.combatTeilnehmer.push({teilnehmnerId: 3, ini: 20, name: "Charlie", leben: 13});
        this.sortTeilnehmer();
    }

    addTeilnehmer(newTeilnehmer: Teilnehmer): void {
        newTeilnehmer.teilnehmnerId = this.globalTeilnehmerCount + 1;
        this.globalTeilnehmerCount = this.globalTeilnehmerCount + 1;
        this.combatTeilnehmer.push(newTeilnehmer);
        this.sortTeilnehmer(); 
        this.updateHighlightWhenPlayerAdded(newTeilnehmer.ini);
    }

    getTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer;
    }

    sortTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer.sort((a, b) => b.ini - a.ini); // Absteigende Sortierung
    }

    updateEditedField(currentDiv: HTMLElement, newInputValue: string, Teilnehmer: HTMLElement): void {
        // sucht den alten Wert aus dem Array und erstzt ihn durch den neuen Wert
        // noch unsicher, wie ich die Daten raussuche.. am besten Index für ELement angeben. Aber wie? 
        const id = Teilnehmer.dataset.teilnehmerId;
        const foundTeilnehmer = this.combatTeilnehmer.find(Teilnehmer => Teilnehmer.teilnehmnerId === Number(id));

        if (!foundTeilnehmer) {
            console.error("Teilnehmer nicht gefunden! (combat-state / updateEditedField())");
            return;
        }

        if (currentDiv.dataset.divType === "leben") {
            foundTeilnehmer.leben = Number(newInputValue);
            return;
        } else if (currentDiv.dataset.divType === "ini") { 
            foundTeilnehmer.ini = Number(newInputValue);
            this.sortTeilnehmer();
            this.updateHighlightWhenPlayerAdded(foundTeilnehmer.ini);
            return;
        } else if (currentDiv.dataset.divType === "name") {
            foundTeilnehmer.name = String(newInputValue);
            return;
        } else {
            console.error("divType nicht in Teilnehmer vorhanden! (combat-state / updateEditableField())");
        }
    }

    nextCombatTeilnehmer(): void {
        if (this.combatTeilnehmer == null) { // Null-check, fall kein Teilnehmer in der Liste
            new Notice("Keinen Teilnehmer gefunden. (combat-state / nextCombatTeilnehmer");
            return;
        }
         // Kein aktiver Teilnehmer, also Anfang der Liste beginnen activeTeilnehmer = 0
         // Hier kann als Erweiterung später noch geschaut werden, ob leben > 0 ist, sonst
         // kann der Entrag übersprungen werden
        this.activeTeilnehmer = (this.activeTeilnehmer + 1) % this.globalTeilnehmerCount;
    }

    // Wenn ein Teilnehmer mehr oder gleich viel ini hat wie der aktuelle gehighlightete
    // Teilnehmer, wird der Highlight counter verschoben, um das Highlight auf dem  
    // aktuellen Teilnehmer zu behalten.
    // Kann erweitert werden, wenn > 1 Teilnehmer auf einmal zur Liste hinzugefügt werden
    // kann. 
    updateHighlightWhenPlayerAdded(iniTeilnehmer: number): void {
        if (this.activeTeilnehmer > 0 && this.combatTeilnehmer[this.activeTeilnehmer]!.ini <= iniTeilnehmer) {
            this.activeTeilnehmer++;
        }
    }

    isCombatTeilnehmerEmpty(): boolean {
        return this.combatTeilnehmer.length <= 0 ? true : false;
    } 

    // Gibt den Index des aktuell gehighlighteten Teilnehmers im Array zurück
    getActiveTeilnehmer(): number {
        return this.activeTeilnehmer;
    }
}