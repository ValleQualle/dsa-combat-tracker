import { Teilnehmer } from '../src/types';

// In dieser Datei werden Teilnehmer vorgefertigt, die in den
// Test Dateien verwendet werden können

export let valle: Teilnehmer = { teilnehmerId: 0, ini: 20, name: 'Valle', leben: 25 };
export let lilly: Teilnehmer = { teilnehmerId: 0, ini: 15, name: 'Lilly', leben: 20 };
export let nadine: Teilnehmer = { teilnehmerId: 0, ini: 10, name: 'Nadine', leben: 18 };
export let judith: Teilnehmer = { teilnehmerId: 0, ini: 5, name: 'Judith', leben: 28 };

export const alleTeilnehmer: Teilnehmer[] = [valle, lilly, nadine, judith];