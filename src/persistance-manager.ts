
/* 
    This class handles all the features of saving and loading 
    combat states. It also manages the saving and loading of
    participant templates and combat templates

    The PersistanceManager is known by main to be initiated 
    but only listens to and acts on events. The PersistanceManager
    is not called directly.
*/

import { Component , Notice, TFile, Vault , App } from "obsidian";
import { RecoveryData } from 'types';

export class PersistanceManager extends Component {

    private vault: Vault;

    constructor(private appVault: Vault) {
        super();

        this.vault = appVault;
    } 

    // The file gets the .json postfix so it is not shown in the Obsidian UI itself. 
    // The file can be seen and edited in the PCs file system 
    async autosave(data: RecoveryData): Promise<void> {
        if (!this.vault.getFileByPath("combatTrackerRecoveryFile.json")) {
            this.vault.create("combatTrackerRecoveryFile.json", JSON.stringify(data, null, 2));
        } else {
            // recoveryFile must be found because of the if - check beforehand
            let recoveryFile: TFile | null = this.vault.getFileByPath('combatTrackerRecoveryFile.json');
            this.vault.modify(recoveryFile!, JSON.stringify(data, null, 2));
        }
    }

    // This method is called on restart of the plugin / Obsidian itself
    async loadAutosave(): Promise<RecoveryData | null> {
        let recoveryFile: TFile | null = this.vault.getFileByPath('combatTrackerRecoveryFile.json');
        if (recoveryFile != null) {
            let recoveryFileData = await this.vault.read(recoveryFile);

            let outputData = JSON.parse(recoveryFileData);
            return outputData;
        } 
        return recoveryFile;
    }
}