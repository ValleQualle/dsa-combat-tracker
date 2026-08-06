import { Teilnehmer } from './types';
import { Notice } from 'obsidian';

export class CombatState { // Erbt von nichts, da kein View oder Plugin
    // Das Array, was die Teilnehmer als Objekte hält
    private combatTeilnehmer: Teilnehmer[] = [];
    // Anzahl der Teilnehmer im gesamten Combat
    private globalTeilnehmerCount: number = 0;
    // Ein TEMPORÄRER Speicher für die Bearbeitung des aktuellen Teilnehmers
    private activeTeilnehmerID: number = -1;
    // Variable, die die letzte vergebene ID hält, um dem nächsten Teilnehmer
    // eine eindeutige Nummer geben zu können
    private newTeilnehmerID: number = 0;
    
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
        newTeilnehmer.teilnehmerId = this.newTeilnehmerID + 1;
        this.newTeilnehmerID++;
        this.globalTeilnehmerCount = this.globalTeilnehmerCount + 1;
        this.combatTeilnehmer.push(newTeilnehmer);
        this.sortTeilnehmer();
    }

    // Ein bestimmter Teilnehmer wird aus der combatTeilnehmer Liste entfernt
    // Es wird ein ganz neues Array erstellt, dass nur den entfernten TN nicht
    // mehr hält. Das neue Array überschreibt das alte
    removeTeilnehmer(teilnehmer: Teilnehmer) {
        let tempCombatTeilnehmer: Teilnehmer[] = [];
        let index = 0;
        for (index; index < this.combatTeilnehmer.length; index++) {
            if (this.combatTeilnehmer[index] === teilnehmer) {
                continue;
            } else {
                tempCombatTeilnehmer.push(this.combatTeilnehmer[index]!);
            }
        }
        this.combatTeilnehmer = tempCombatTeilnehmer;
    }

    getTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer;
    }

    sortTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer.sort((a, b) => b.ini - a.ini); // Absteigende Sortierung
    }

    updateEditedField(field: string | null, newInputValue: string, id: number): void {
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
        if (this.activeTeilnehmerID === -1 && !this.isCombatTeilnehmerEmpty()) {
            this.activeTeilnehmerID = this.combatTeilnehmer[0]!.teilnehmerId;
        // Eine do-while-Schleife wählt so lange den nächsten TN aus, bis einer > 0 Leben besitzt
        } else {
            let counter = 0;
            do {
                counter++;
                this.activeTeilnehmerID = this.combatTeilnehmer[(this.getActiveTeilnehmerIndex() + 1) % this.globalTeilnehmerCount]!.teilnehmerId;
            } while ((this.combatTeilnehmer[this.getActiveTeilnehmerIndex()]!.leben <= 0) && (counter <= this.globalTeilnehmerCount));
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