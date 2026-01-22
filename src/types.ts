// Der Aufbau der Objekte, die dazu genutzt werden, um den Kampf zu traken [INI, Name, Leben] (Leben kann später noch hinzugefügt werden)
export interface Teilnehmer {
    teilnehmnerId: number;
    ini: number;
    name: string;
    leben: number;
}
