import { Teilnehmer } from './types';
import { Notice } from 'obsidian';

export class CombatState { // Erbt von nichts, da kein View oder Plugin
    private combatTeilnehmer: Teilnehmer[] = [];
    private globalTeilnehmerCount: number = 0;
    // Hier muss die teilnehmerID genutzt werden. In der Liste suchen und dann Highlighten?
    private activeTeilnehmerID: number = -1; // Der Index des Teilnehmers, der gerade gehighlightet ist
    
    defaultTeilnehmerArray(): void {
        this.combatTeilnehmer.push({teilnehmerId: 1, ini: 15, name: "Alice", leben: 10});
        this.combatTeilnehmer.push({teilnehmerId: 2, ini: 12, name: "Bob", leben: 25});
        this.combatTeilnehmer.push({teilnehmerId: 3, ini: 20, name: "Charlie", leben: 13});
        this.sortTeilnehmer();
    }

    addTeilnehmer(newTeilnehmer: Teilnehmer): void {
        if (this.activeTeilnehmerID === -1) {
            this.activeTeilnehmerID = newTeilnehmer.teilnehmerId;
        }
        newTeilnehmer.teilnehmerId = this.globalTeilnehmerCount + 1;
        this.globalTeilnehmerCount = this.globalTeilnehmerCount + 1;
        this.combatTeilnehmer.push(newTeilnehmer);
        this.sortTeilnehmer();
    }

    getTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer;
    }

    sortTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer.sort((a, b) => b.ini - a.ini); // Absteigende Sortierung
    }

    updateEditedField(field: string, newInputValue: string, id: number): void {
        // sucht den alten Wert aus dem Array und erstzt ihn durch den neuen Wert
        // noch unsicher, wie ich die Daten raussuche.. am besten Index für ELement angeben. Aber wie? 
        let foundTeilnehmer = this.combatTeilnehmer.find(Teilnehmer => Teilnehmer.teilnehmerId == Number(id));

        if (!foundTeilnehmer) {
            throw new Error('Teilnehmer nicht gefunden! (combat-state / updateEditedField())')
        }

        if (field === "leben") {
            foundTeilnehmer.leben = Number(newInputValue);
            return;
        } else if (field === "ini") { 
            foundTeilnehmer.ini = Number(newInputValue);
            this.sortTeilnehmer();
            return;
        } else if (field === "name") {
            foundTeilnehmer.name = String(newInputValue);
            return;
        } else {
            console.error("divType nicht in Teilnehmer vorhanden! (combat-state / updateEditableField())");
        }
    }

    nextCombatTeilnehmer(): void {
        // Wenn die Liste der Teilnehmer nicht definiert oder definiert aber leer ist,
        // wirft der Versuch ein Highlight zu setzen einen Error
        if (this.combatTeilnehmer == null || this.isCombatTeilnehmerEmpty()) { // Null-check, fall kein Teilnehmer in der Liste
            throw new Error('Keinen Teilnehmer gefunden. (combat-state / nextCombatTeilnehmer())');
        }
         // Kein aktiver Teilnehmer, also Anfang der Liste beginnen activeTeilnehmerIndex = 0
         // Hier kann als Erweiterung später noch geschaut werden, ob leben > 0 ist, sonst
         // kann der Entrag übersprungen werden
        if (this.activeTeilnehmerID === -1 && !this.isCombatTeilnehmerEmpty()) {
            this.activeTeilnehmerID = this.combatTeilnehmer[0]!.teilnehmerId;
        } else {
            this.activeTeilnehmerID = this.combatTeilnehmer[(this.getActiveTeilnehmerIndex() + 1) % this.globalTeilnehmerCount]!.teilnehmerId;
        }
        
    }

    isCombatTeilnehmerEmpty(): boolean {
        return this.combatTeilnehmer.length <= 0 ? true : false;
    } 

    // Gibt den die teilnehmerID des aktuell gehighlighteten Teilnehmers im Array zurück
    getActiveTeilnehmerID(): number {
        return this.isCombatTeilnehmerEmpty() ? -1 : this.activeTeilnehmerID;
    }

    // Gibt den Index des aktiven Teilnehmers in dem Array zurück.
    // Wenn kein Teilnehmer in der Liste ist, wird ein Error ausgegeben
    getActiveTeilnehmerIndex(): number {
        let index = 0;
        for (index; index < this.combatTeilnehmer.length; index++) {
            if (this.combatTeilnehmer[index]?.teilnehmerId === this.activeTeilnehmerID) {
                return index;
            }
        }
        return -1;
    }
}