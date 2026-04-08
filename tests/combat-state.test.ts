import { expect , test , it , vi , describe } from 'vitest'
import * as CS from '../src/combat-state' // CS für combat-state
import { CombatState } from '../src/combat-state' // Noch einmal extra für den obsidian mock

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


test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

test('pfad', () => {
  const state = new CS.CombatState()
  expect(state.isCombatTeilnehmerEmpty()).toBe(true)
})