import type { Teilnehmer } from './types';

export class CombatState { // Erbt von nichts, da kein View oder Plugin
    private combatTeilnehmer: Teilnehmer[] = [];

    defaultTeilnehmerArray(): void {
        this.combatTeilnehmer.push({ini: 15, name: "Alice", leben: 10});
        this.combatTeilnehmer.push({ini: 12, name: "Bob", leben: 25});
        this.combatTeilnehmer.push({ini: 20, name: "Charlie", leben: 13});
        this.sortTeilnehmer();
    }

    addTeilnehmer(newTeilnehmer: Teilnehmer): void {
        this.combatTeilnehmer.push(newTeilnehmer);
        this.sortTeilnehmer(); 
    }

    getTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer;
    }

    sortTeilnehmer(): Teilnehmer[] {
        return this.combatTeilnehmer.sort((a, b) => b.ini - a.ini); // Absteigende Sortierung
    }

    updateInputInView(event: MouseEvent): void {
        console.log("Nach Render, State:", event.target);
    }
}