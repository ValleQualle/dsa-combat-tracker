// Der Aufbau der Objekte, die dazu genutzt werden, um den Kampf zu traken [INI, Name, Leben] (Leben kann später noch hinzugefügt werden)
export interface Teilnehmer {
    teilnehmerId: number;
    ini: number;
    name: string;
    leben: number;
}

// The interface for saving the session data
// in case obsidian is closed. The data is can be
// restored on reopen
export interface RecoveryData {
    combatTeilnehmer: Teilnehmer[],
    globalTeilnehmerCount: number,
    activeTeilnehmerID: number,
    newTeilnehmerID: number,
    roundCounter: number
}