// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

import {DockManager} from './docking.js';
import {Extension} from './dependencies/shell/extensions/extension.js';
import {Main} from './dependencies/shell/ui.js';

// We export this so it can be accessed by other extensions
export let dockManager;

export default class DashToDockExtension extends Extension.Extension {
    enable() {
        dockManager = new DockManager(this);

        this._settings = this.getSettings(
            'org.gnome.shell.extensions.super-desktop');
        this._activitiesButton = Main.panel.statusArea.activities;

        this._applyActivitiesVisibility();
        this._activitiesChangedId = this._settings.connect(
            'changed::hide-activities-button',
            () => this._applyActivitiesVisibility());

        if (Main.layoutManager.removeHotCorner)
            Main.layoutManager.removeHotCorner();
    }

    disable() {
        if (this._settings && this._activitiesChangedId) {
            this._settings.disconnect(this._activitiesChangedId);
            this._activitiesChangedId = 0;
        }
        this._settings = null;

        if (this._activitiesButton) {
            this._activitiesButton.show();
            this._activitiesButton.container?.show();
        }
        this._activitiesButton = null;

        if (Main.layoutManager.addHotCorner)
            Main.layoutManager._updateHotCorners();

        dockManager?.destroy();
        dockManager = null;
    }

    _applyActivitiesVisibility() {
        if (!this._activitiesButton)
            return;
        if (this._settings.get_boolean('hide-activities-button')) {
            this._activitiesButton.hide();
            this._activitiesButton.container?.hide();
        } else {
            this._activitiesButton.show();
            this._activitiesButton.container?.show();
        }
    }
}
