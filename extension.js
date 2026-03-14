// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

import {DockManager} from './docking.js';
import {Extension} from './dependencies/shell/extensions/extension.js';
import {Main} from './dependencies/shell/ui.js';

// We export this so it can be accessed by other extensions
export let dockManager;

export default class DashToDockExtension extends Extension.Extension {
    enable() {
        dockManager = new DockManager(this);

        // Hide Activities button / Workspace Indicator
        this._activitiesButton = Main.panel.statusArea.activities;
        if (this._activitiesButton) {
            this._activitiesButton.hide();
            // Also hide the container if hide() on the button isn't enough
            this._activitiesButton.container?.hide();
        }

        // Disable hot corner
        if (Main.layoutManager.removeHotCorner)
            Main.layoutManager.removeHotCorner();
    }

    disable() {
        if (this._activitiesButton) {
            this._activitiesButton.show();
            this._activitiesButton.container?.show();
        }
        this._activitiesButton = null;

        if (this._hotCornerWasEnabled && Main.layoutManager.addHotCorner)
            Main.layoutManager._updateHotCorners();

        dockManager?.destroy();
        dockManager = null;
    }
}
