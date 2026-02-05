import type { Teilnehmer } from './types';
import { Teilnehmer } from './types';

export class CombatState { // Erbt von nichts, da kein View oder Plugin
    private combatTeilnehmer: Teilnehmer[] = [];
    private globalTeilnehmerCount: number;

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
        console.log(Teilnehmer.dataset);
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
            return;
        } else if (currentDiv.dataset.divType === "name") {
            foundTeilnehmer.name = String(newInputValue);
            return;
        } else {
            console.error("divType nicht in Teilnehmer vorhanden! (combat-state / updateEditableField())");
        }
    }
}