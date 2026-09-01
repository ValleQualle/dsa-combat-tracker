import {App, Editor, MarkdownView, Modal, Notice, Plugin, WorkspaceLeaf} from 'obsidian';
import {DEFAULT_SETTINGS, DSACombatTrackerSettings, DSACombatTrackerSettingTab} from "./settings";
import { CombatView, VIEW_TYPE_EXAMPLE } from './combat-view';
import { RecoveryData } from 'types';
import { CombatState } from 'combat-state';
import { PersistanceManager } from 'persistance-manager';
// import DSACombatTracker from './main';

// Remember to rename these classes and interfaces!

export default class DSACombatTracker extends Plugin {
	settings: DSACombatTrackerSettings;
	combatState: CombatState;
	persistanceManager: PersistanceManager;

	async onload() {
		const vault = this.app.vault;
		console.log(this.app.vault.getFiles().map(file => file.path));
		console.log(
			await this.app.vault.adapter.list("")
		);

		await this.loadSettings();
		
		// await this.loadCombatState();

		// Here the RecoveryData must be checked, if it exists
		// if so, the RecoveryData must be loaded into the combatState.
		this.combatState = new CombatState;
		this.persistanceManager = new PersistanceManager(vault);

		this.registerView(
		VIEW_TYPE_EXAMPLE,
		(leaf) => new CombatView(leaf ,this.combatState));

		// This creates an icon in the left ribbon.

		this.addRibbonIcon('dice', 'Open combat view', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// new Notice('This is a notice!');
			// Öffnet neues Fenster des Plugins? -valle
			void this.activateView();
		});

		// Zeigt alle Leaves im workspace an
		this.addRibbonIcon('dice', 'Print leaf types', () => {
			this.app.workspace.iterateAllLeaves((leaf) => {
				console.debug(leaf.getViewState().type);
			});
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status bar text');
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection('Sample editor command');
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DSACombatTrackerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		/*
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			new Notice("Click");
		});
		*/

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		// The autosave file is being read and wrote to the combat state for recovery of 
		// the old state
		this.persistanceManager.loadAutosave().then((data: RecoveryData | null) => {
			this.combatState.setCombatState(data);
		});

		// Listening for saving Trigger
		// If there are too many trigger in main, maybe outsource the trigger to a
		// dedicated trigger file
		this.registerEvent(
			this.combatState.on('autosave-combat', () => {
				this.persistanceManager.autosave(this.combatState.getRecoveryData());
			})
		);

		console.debug("DSA Combat Tracker geladen");
	}

	onunload() {
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

		if (leaves.length > 0) {
			// A leaf already exists, use that
			leaf = leaves[0]!;
		} else {
			// View doesn't exist yet, create new leaf
			// in the right sidebar
			leaf = workspace.getRightLeaf(false);
			await leaf!.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true});
		}

		// Reveal leaf in sidebar in case it's collapsed
		void workspace.revealLeaf(leaf!);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<DSACombatTrackerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadCombatState(): Promise<void>{
	}

	async saveCombatState() {
	}
}