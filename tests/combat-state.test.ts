import { expect , test , it , vi , describe } from 'vitest'
import * as CS from '../src/combat-state' // CS für Combat-State
import { CombatState } from '../src/combat-state' // Noch einmal extra für den obsidian mock
import { Teilnehmer } from '../src/types';
import { alleTeilnehmer } from './testTeilnehmer';

// ----------------------------
// Mock für das "obsidian"-Modul
vi.mock('obsidian', () => {
  return {
    Notice: class {
      constructor(public message: string) {}
    },
  };
});

describe('CombatState', () => {
  it('should create an instance', () => {
    const state = new CombatState();
    expect(state).toBeInstanceOf(CombatState);
  });
});
// ----------------------------


test('addTeilnehmer', () => {
  const state = new CS.CombatState();
  const tn: Teilnehmer = alleTeilnehmer[0]!;
  state.addTeilnehmer(tn);
  expect(state.isCombatTeilnehmerEmpty()).toBe(false)
})

test('activeTN == -1, wenn highlight nicht gesetzt', () => {
  const state = new CS.CombatState();
  // Alle 4 Teilnehmer in die Liste laden 
  state.addTeilnehmer(alleTeilnehmer[0]!);
  state.addTeilnehmer(alleTeilnehmer[1]!);
  state.addTeilnehmer(alleTeilnehmer[2]!);
  state.addTeilnehmer(alleTeilnehmer[3]!);
  // Es gibt noch kein Highlight, also auch keinen aktiven Teilnehnmer
  expect(state.getActiveTeilnehmer()).toBe(-1);
})

// Das Highlight wird auf einer nicht leeren Liste das erste Mal gesetzt
test('Highlight initial auf activeTN == 0', () => {
  const state = new CS.CombatState();
  // 3 Teilnehmer in die Liste laden 
  state.addTeilnehmer(alleTeilnehmer[0]!);
  state.addTeilnehmer(alleTeilnehmer[1]!);
  state.addTeilnehmer(alleTeilnehmer[2]!);

  state.nextCombatTeilnehmer(); // Highlight wird das erste Mal ausgelöst

  expect(state.getActiveTeilnehmer()).toBe(0);
})

// Das Highlight wird auf einer leeren Liste gesetzt
test('Highlight auf leerer Liste starten', () => {
  const state = new CS.CombatState();

  expect(() => state.nextCombatTeilnehmer()).toThrow('Keinen Teilnehmer gefunden. (combat-state / nextCombatTeilnehmer');
})

// Nicht leere Liste, activeTN == 0, 
// neuer TN wird vor activeTN hinzugefügt (ini > activeTN.ini)
test('Neuer TN Highlight-Verhalten 1 (>)', () => {
  const state = new CS.CombatState();
  // 3 Teilnehmer in die Liste laden 
  state.addTeilnehmer(alleTeilnehmer[3]!); // 5
  state.addTeilnehmer(alleTeilnehmer[1]!); // 15
  state.addTeilnehmer(alleTeilnehmer[2]!); // 10

  state.nextCombatTeilnehmer(); // activeTN == 0

  state.addTeilnehmer(alleTeilnehmer[0]!); // TN mit höherer ini als activeTN

  expect(state.getActiveTeilnehmer()).toBe(1); 
}) 

// Nicht leere Liste, activeTN == len, 
// neuer TN wird vor activeTN hinzugefügt (ini > activeTN.ini)
test('Neuer TN Highlight-Verhalten 2 (>)', () => {
  const state = new CS.CombatState();
  // 3 Teilnehmer in die Liste laden 
  state.addTeilnehmer(alleTeilnehmer[3]!);
  state.addTeilnehmer(alleTeilnehmer[1]!);
  state.addTeilnehmer(alleTeilnehmer[2]!);

  state.nextCombatTeilnehmer(); // activeTN == 0
  state.nextCombatTeilnehmer(); // activeTN == 1
  state.nextCombatTeilnehmer(); // activeTN == 2

  state.addTeilnehmer(alleTeilnehmer[0]!); // TN mit höherer ini als activeTN

  expect(state.getActiveTeilnehmer()).toBe(3); 
}) 

// Nicht leere Liste, activeTN == len, 
// neuer TN wird vor activeTN hinzugefügt (ini < activeTN.ini)
test('Neuer TN Highlight-Verhalten 3 (<)', () => {
  const state = new CS.CombatState();
  // 3 Teilnehmer in die Liste laden 
  state.addTeilnehmer(alleTeilnehmer[0]!); // 20
  state.addTeilnehmer(alleTeilnehmer[1]!); // 15
  state.addTeilnehmer(alleTeilnehmer[2]!); // 10

  state.nextCombatTeilnehmer(); // activeTN == 0
  state.nextCombatTeilnehmer(); // activeTN == 1

  state.addTeilnehmer(alleTeilnehmer[3]!); // TN mit höherer ini als activeTN

  expect(state.getActiveTeilnehmer()).toBe(1); 
})

// Nicht leere Liste, activeTN == len, 
// bestehender TN wird vor activeTN verschoben (ini < activeTN.ini)
test('Verschobener TN Highlight-Verhalten 4 (<)', () => {
  const state = new CS.CombatState();
  // 3 Teilnehmer in die Liste laden 
  state.addTeilnehmer(alleTeilnehmer[0]!); // 20
  state.addTeilnehmer(alleTeilnehmer[1]!); // 15
  state.addTeilnehmer(alleTeilnehmer[2]!); // 10
  state.addTeilnehmer(alleTeilnehmer[3]!); // 5

  state.nextCombatTeilnehmer(); // activeTN == 0
  state.nextCombatTeilnehmer(); // activeTN == 1
  state.nextCombatTeilnehmer(); // activeTN == 2

  state.updateEditedField('ini', '3', 1);

  expect(state.getActiveTeilnehmer()).toBe(1);
})