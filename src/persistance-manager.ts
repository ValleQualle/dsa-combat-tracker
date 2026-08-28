
/* 
    This class handles all the features of saving and loading 
    combat states. It also manages the saving and loading of
    participant templates and combat templates

    The PersistanceManager is known by main to be initiated 
    but only listens to and acts on events. The PersistanceManager
    is not called directly.
*/

import { Component, Notice, App } from "obsidian";

export class PersistanceManager extends Component {

    async autosave() {
        new Notice("autosave triggered");
    }
}