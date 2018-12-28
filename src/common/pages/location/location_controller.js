/** ****************************************************************************
 * Location controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
// import Morel from 'morel';
import { Log, GridRefUtils } from 'helpers'; // Validate, StringHelp, LocHelp,
import App from 'app';
import recordManager from '../../record_manager';
import appModel from '../../models/app_model';
import MainView from './location_main_view';
// import CONFIG from 'config';
import './styles.scss';

const LocationController = {
  show(recordID) {
    Log('Location:Controller: showing.');

    recordManager.get(recordID, (err, recordModel) => {
      // Not found
      if (!recordModel) {
        App.trigger('404:show', { replace: true });
        return;
      }

      // MAIN
      const mainView = new MainView({
        model: new Backbone.Model({ recordModel, appModel }),
        vent: App,
      });

      // listen to events
      mainView.on('location:select:map', (loc, createNew) => {
        LocationController.onLocationSelect(recordModel, loc, createNew);
      });
      mainView.on('gps:click', () => {
        LocationController.onGPSClick(recordModel);
      });
      // mainView.on('location:name:change', (name) => {
      //   LocationController.onLocationNameChange(recordModel, name);
      // });
      mainView.on('location:gridref:change', (gridRefString) => {
        LocationController.onManualGridrefChange(recordModel, gridRefString);
      });
      mainView.on('lock:click:location', LocationController.onLocationLockClick);
      // mainView.on('lock:click:name', LocationController.onNameLockClick);
      const location = recordModel.get('location') || {};
      // const name = recordModel.get('location_name');
      const locationIsLocked = appModel.isAttrLocked('location', location);
      // const nameIsLocked = appModel.isAttrLocked('location_name', currentVal);
      mainView.on('navigateBack', () => {
        LocationController.exit(recordModel, locationIsLocked);
      });

      App.regions.getRegion('main').show(mainView);

      // HEADER
      App.regions.getRegion('header').hide();
    });

    // FOOTER
    App.regions.getRegion('footer').hide().empty();

    document.getElementById('main').style.zIndex = '2000';
  },

  exit(recordModel, locationIsLocked) {
    Log('Location:Controller: exiting.');

    document.getElementById('main').style.zIndex = 'auto';

    recordModel.save(null, {
      success: () => {
        // save to past locations and update location ID on record
        // const location = recordModel.get('location') || {};
        // if ((location.latitude && location.longitude)) {
        //   const locationName = recordModel.get('location_name');
        //   location.id = appModel.setLocation(location, locationName);
        //   recordModel.set('location', location);
        // }
        //

        LocationController.updateLocks(recordModel, locationIsLocked);

        window.history.back();
      },
      error: (error) => {
        Log(error, 'e');
        App.regions.getRegion('dialog').error(error);
      },
    });
  },

  updateLocks(recordModel, locationIsLocked) {
    Log('Location:Controller: updating locks.');

    const location = recordModel.get('location') || {};
    // const locationName = recordModel.get('location_name');
    const lockedLocation = appModel.getAttrLock('location');
    // const lockedName = appModel.getAttrLock('location_name');

    // reset
    if (lockedLocation === true && (!location.latitude || !location.longitude)) {
      appModel.setAttrLock('location', null);
    }
    // if (lockedName === true && !locationName) {
    //  appModel.setAttrLock('location_name', null);
    // }

    // location
    if (lockedLocation) {
      // check if previously the value was locked and we are updating
      if (locationIsLocked || lockedLocation === true) {
        Log('Updating lock', 'd');

        if (location.source === 'gps') {
          // on GPS don't lock
          location.source = 'gridref';
        }
        appModel.setAttrLock('location', location);
      }
    }

    // name
    // if (lockedName && (lockedName === true || lockedName === locationName)) {
    //   appModel.setAttrLock('location_name', locationName);
    // }
    // if (CONFIG.AUTO_LOCK_LOCATION_NAME && locationName) {
    //   // no explicit lock request by user, but remember name anyway
    //   appModel.setAttrLock('location_name', locationName);
    // }
  },

  // onLocationNameChange(recordModel, name) {
  //   Log('Location:Controller: executing onLocationNameChange.');
  //
  //   if (!name || typeof name !== 'string') {
  //     return;
  //   }
  //
  //   const escapedName = StringHelp.escape(name);
  //   recordModel.set('location_name', escapedName);
  // },

  onManualGridrefChange(recordModel, gridRefString) {
    Log('Location:Controller: executing onManualGridrefChange.');

    /**
     * Validates grid ref
     * @param {string} gridRefString
     * @returns {{}}
     */
    // function validate(gridRefString) {
    //  const errors = {};
    //  gridRefString = gridRefString.replace(/\s/g, '').toUpperCase();
    //  if (!LocHelp.gridrefStringToLatLng(gridRefString)) {
    //    errors.gridref = 'invalid';
    //  }
    //
    //  if (!_.isEmpty(errors)) {
    //    return errors;
    //  }
    //
    //  return null;
    // }

    // const validationError = validate(gridRefString);

    const cleanGridRefString = gridRefString.replace(/\s/g, '').toUpperCase();

    if (cleanGridRefString !== '') {
      const parsedGridRef = GridRefUtils.GridRefParser.factory(cleanGridRefString);

      if (parsedGridRef) {
        const location = recordModel.get('location') || {};
        const latLng = parsedGridRef.osRef.to_latLng();

        location.source = 'gridref';
        location.gridref = parsedGridRef.preciseGridRef;
        location.latitude = latLng.lat;
        location.longitude = latLng.lng;
        location.accuracy = parsedGridRef.length / 2; // radius rather than square dimension

        LocationController.onLocationSelect(recordModel, location);

        // lock a typed gridref automatically (TAH 2018_12_28)
        appModel.setAttrLock('location', location);
      } else {
        App.trigger('gridref:form:data:invalid', {
          gridref: 'invalid',
        });
      }
    } else {
      const location = recordModel.get('location') || {};
      location.source = null; // unsure what this should be
      location.gridref = '';
      location.latitude = null;
      location.longitude = null;
      location.accuracy = null;

      LocationController.onLocationSelect(recordModel, location);
    }

    recordModel.markChangedAndResave(); // newly added by TH
    // @todo Should probably remove the save in exit()

    // if (!validationError) {
    //  App.trigger('gridref:form:data:invalid', {}); // update form
    //  const latLon = LocHelp.gridrefStringToLatLng(cleanGridRefString);
    //
    //  const location = recordModel.get('location') || {};
    //  // location.name = StringHelp.escape(name);
    //  // recordModel.set('location', location);
    //  // recordModel.trigger('change:location');
    //
    //  location.source = 'gridref';
    //  location.gridref = gridRefString;
    //  location.latitude = parseFloat(latLon.lat.toFixed(8));
    //  location.longitude = parseFloat(latLon.lng.toFixed(8));
    //
    //  // -2 because of gridref letters, 2 because this is min precision
    //  // @todo Irish GR issue
    //  // @todo tetrad issue
    //  // const accuracy = (cleanGridRefString.replace(/\s/g, '').length - 2) || 2;
    //  const grSquareDimension = Math.pow(10, 5 - ((cleanGridRefString.replace(/\s/g, '').length - 2) / 2));
    //
    //  location.accuracy = grSquareDimension / 2; // accuracy is radius, so for squares use half dimension
    //
    //  LocationController.onLocationSelect(recordModel, location);
    //  // LocationController.exit();
    // } else {
    //  App.trigger('gridref:form:data:invalid', validationError);
    // }
  },

  onLocationSelect(recordModel, loc, createNew) {
    Log('Location:Controller: executing onLocationSelect.');

    if (typeof loc !== 'object') {
      // jQuery event object bug fix
      Log('Location:Controller:onLocationSelect: loc is not an object', 'e');
      return;
    }

    let location = loc;
    // we don't need the GPS running and overwriting the selected location
    if (recordModel.isGPSRunning()) {
      recordModel.stopGPS({ silent: true });
    }

    if (!createNew) {
      // extend old location to preserve its previous attributes like name or id
      let oldLocation = recordModel.get('location');
      if (!_.isObject(oldLocation)) oldLocation = {}; // check for locked true
      location = $.extend(oldLocation, location);
    }

    recordModel.set('location', location);
    recordModel.trigger('change:location');

    recordModel.markChangedAndResave(); // newly added by TH
  },

  onGPSClick(recordModel) {
    Log('Location:Controller: executing onGPSClick.');

    // turn off if running
    if (recordModel.isGPSRunning()) {
      recordModel.stopGPS();
    } else {
      recordModel.startGPS();
    }
  },

  onLocationLockClick() {
    Log('Location:Controller: executing onLocationLockClick.');
    // invert the lock of the attribute
    // real value will be put on exit


    appModel.setAttrLock('location', !appModel.getAttrLock('location'));
  },

  // onNameLockClick() {
  //   Log('Location:Controller: executing onNameLockClick.');
  //   // invert the lock of the attribute
  //   // real value will be put on exit
  //   appModel.setAttrLock('location_name', !appModel.getAttrLock('location_name'));
  // },
};

export { LocationController as default };
