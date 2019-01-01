import Backbone from 'backbone';
import { Log } from 'helpers';
import App from 'app';
// import userModel from '../../common/models/user_model';
import MainView from './menu_main_view';
import HeaderView from '../../common/views/header_view';
import recordManager from "../../common/record_manager";
import appModel from "../../common/models/app_model";

const API = {
  show() {
    const mainView = new MainView({ model: appModel }); // was userModel
    App.regions.getRegion('main').show(mainView);

    // mainView.on('user:logout', API.logout);

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Menu',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    mainView.on('app:reset', () => {
      App.regions.getRegion('dialog').show({
        title: 'Reset',
        class: 'error',
        body: 'Are you sure you want to clear the local copy of your records, unsent data will lost?' +
        '</br>Choose this option if you want to start a new Plant Hunt list',
        buttons: [
          {
            title: 'Cancel',
            onClick() {
              App.regions.getRegion('dialog').hide();
            },
          },
          {
            title: 'Reset',
            class: 'btn-negative',
            onClick() {
              // delete all
              API.resetApp(() => {
                App.regions.getRegion('dialog').show({
                  title: 'Done!',
                  timeout: 1000,
                });

                // should navigate back to the main screen
              });
            },
          },
        ],
      });
    });

    mainView.on('setting:toggled', (setting, on) => {
      Log('Settings:Menu:Controller: setting toggled');

      if (setting === 'gpsEnabled' && on) {
        // turning on GPS, so clear any previously locked gridreference

        appModel.setAttrLock('location', null);
      }

      appModel.set(setting, on);
      appModel.save();
    });
  },

  logout() {
    Log('Info:Menu:Controller: logging out');
    // userModel.logOut();
  },

  resetApp(callback) {
    Log('Settings:Menu:Controller: resetting the application!', 'w');

    appModel.clear().set(appModel.defaults);
    appModel.setUuid();
    appModel.save();

    // userModel.clear().set(userModel.defaults);
    // userModel.save();

    recordManager.clearAll(true, callback);

    // Analytics.trackEvent('Settings', 'reset app');
  },
};

export { API as default };
