
/* 
    This class handles all the features of saving and loading 
    combat states. It also manages the saving and loading of
    participant templates and combat templates

    The PersistanceManager is known by main to be initiated 
    but only listens to and acts on events. The PersistanceManager
    is not called directly.
*/

import { Component, Notice, Vault } from "obsidian";
import { RecoveryData } from 'types';

export class PersistanceManager extends Component {

    private vault: Vault;

    constructor(private appVault: Vault) {
        super();

        this.vault = appVault;
    } 

    // The file gets no postfix so it is not shown in the vault itself. 
    // The file can be seen and edited in the PCs file system 
    async autosave(data: RecoveryData): Promise<void> {
        new Notice("autosave triggered");
        this.vault.create("combatTrackerRecoveryFile.json", JSON.stringify(data));
    }
}