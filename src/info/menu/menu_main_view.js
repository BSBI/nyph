/** ****************************************************************************
 * Info Menu main view.
 *****************************************************************************/

import Marionette from 'backbone.marionette';
import JST from 'JST';
import { Device } from 'helpers';
import './styles.scss';
import $ from "jquery";

export default Marionette.View.extend({
  tagName: 'ul',
  className: 'table-view buttons',

  template: JST['info/menu/main'],

  events: {
    // 'click #logout-button': 'logout',
    'toggle #gps-enabled-btn': 'onSettingToggled',
    'click #gps-enabled-btn': 'onSettingToggled',
  },

  triggers: {
    'click #app-reset-btn': 'app:reset',
  },

  modelEvents: {
    change: 'render',
  },

  serializeData() {
    // let surname;
    //
    // if (userModel.hasLogIn()) {
    //   surname = userModel.get('surname');
    // }

    const appModel = this.model;

    return {
      gpsEnabled: appModel.gpsEnabled(),
    };
  },

  onSettingToggled(e) {
    const setting = $(e.currentTarget).data('setting');
    let active = $(e.currentTarget).hasClass('active');

    if (e.type !== 'toggle' && !Device.isMobile()) {
      // Device.isMobile() android generates both swipe and click

      active = !active; // invert because it takes time to get the class
      $(e.currentTarget).toggleClass('active', active);
    }

    this.trigger('setting:toggled', setting, active);
  },

  // logout() {
  //   this.trigger('user:logout');
  // },
});
