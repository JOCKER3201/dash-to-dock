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
        this._dateMenu = Main.panel.statusArea.dateMenu;
        this._dateMenuOriginalParent = this._dateMenu?.container?.get_parent() ?? null;
        this._dateMenuOriginalIndex = this._dateMenuOriginalParent
            ? this._dateMenuOriginalParent.get_children().indexOf(this._dateMenu.container)
            : -1;

        this._applyActivitiesVisibility();
        this._applyDateMenuPosition();
        this._activitiesChangedId = this._settings.connect(
            'changed::hide-activities-button',
            () => {
                this._applyActivitiesVisibility();
                this._applyDateMenuPosition();
            });

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

        this._restoreDateMenuPosition();
        this._dateMenu = null;
        this._dateMenuOriginalParent = null;
        this._dateMenuOriginalIndex = -1;

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

    _applyDateMenuPosition() {
        const container = this._dateMenu?.container;
        if (!container)
            return;
        const parent = container.get_parent();
        if (this._settings.get_boolean('hide-activities-button')) {
            if (parent !== Main.panel._leftBox) {
                parent?.remove_child(container);
                Main.panel._leftBox.insert_child_at_index(container, -1);
            }
        } else {
            this._restoreDateMenuPosition();
        }
    }

    _restoreDateMenuPosition() {
        const container = this._dateMenu?.container;
        if (!container || !this._dateMenuOriginalParent)
            return;
        const parent = container.get_parent();
        if (parent === this._dateMenuOriginalParent)
            return;
        parent?.remove_child(container);
        const index = Math.min(this._dateMenuOriginalIndex,
            this._dateMenuOriginalParent.get_children().length);
        this._dateMenuOriginalParent.insert_child_at_index(container,
            index < 0 ? -1 : index);
    }
}
