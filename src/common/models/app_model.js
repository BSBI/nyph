/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import { Device, Validate, Log } from 'helpers';
import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import CONFIG from 'config';
import pastLocationsExtension from './app_model_past_loc_ext';
import attributeLockExtension from './app_model_attr_lock_ext';
// import userModel from './user_model';

let AppModel = Backbone.Model.extend({
  id: 'app',

  defaults: {
    showIntro: true,
    exceptions: [],

    locations: [],
    attrLocks: {},
    autosync: true,
    useGridRef: true,
    useGridMap: true,
    useTraining: process.env.TRAINING,
    gpsEnabled: null, // default null (initialise later based on whether on mobile device or desktop)
    nyphListEmail: '',
    nyphListRecorders: '',
    nyphListComments: '',
    nyphListPlacename: '',
    nyphListTitle: '',
    nyphListDate: null,
    nyphListUUID: null,
  },

  localStorage: new Store(CONFIG.name),

  /**
   * Initializes the object.
   */
  initialize() {
    this.fetch();

    // let needSave = false;

    const currentNyphListUUID = this.get('nyphListUUID');
    if (!currentNyphListUUID) {
      // this.set('nyphListUUID', this.uuid());
      this.setUuid();
      this.save();
      // needSave = true;
    }

    // because of the messy way app_model is initialised, the Device.isMobile helper
    // apparently isn't yet available when initialise is called
    // if (this.get('gpsEnabled') === null) {
    //   this.set('gpsEnabled', Device.isMobile());
    //   needSave = true;
    // }

    // Log(`gpsEnabled value during initialization: ${this.get('gpsEnabled')}`);

    // if (needSave) {
    //   this.save();
    // }

    // attr lock recorder on login
    // userModel.on('login logout', () => {
    //   if (userModel.hasLogIn()) {
    //     if (!window.nyphAdminMode) {
    //         // only set and lock recorder name for normal user
    //         // and not for the generic Plant Hunt admin account
    //
    //       const surname = userModel.get('surname');
    //       const name = userModel.get('name');
    //       const recorder = `${surname}, ${name}`;
    //       this.setAttrLock('recorder', recorder);
    //     }
    //   } else {
    //     this.unsetAttrLock('recorder');
    //   }
    // });
  },

  /**
   * test gps enabled setting
   * (and initialise if not defined)
   *
   * @return {boolean}
   */
  gpsEnabled() {
    // because of the messy way app_model is initialised, the Device.isMobile helper
    // apparently isn't yet available when initialise is called

    if (this.get('gpsEnabled') === null) {
      Log('Initialising gpsEnabled');

      this.set('gpsEnabled', Device.isMobile());
      this.save();
    }
    Log(`gpsEnabled value when read: ${this.get('gpsEnabled')}`);
    return this.get('gpsEnabled');
  },

  setUuid() {
    this.set('nyphListUUID', this.uuid());
  },

  /**
   * called by backbone isValid()
   * return 'errors' object containing attribute keys with value error messages
   * or null if no errors
   *
   * can't use the standard validate() method as don't want to block saving locally
   *
   * @param attributes
   * @return string|null
   */
  testValidation() {
    const errors = [];

    const nyphListEmail = this.get('nyphListEmail').trim();
    if (nyphListEmail !== '' && !Validate.email(nyphListEmail)) {
      errors[errors.length] = 'Email address appears to be invalid.';
    }

    const nyphListRecorders = this.get('nyphListRecorders').trim();
    if (nyphListRecorders === '') {
      errors[errors.length] = 'Please let us know who took part in your plant hunt.';
    }

    const nyphListPlacename = this.get('nyphListPlacename').trim();
    if (nyphListPlacename === '') {
      errors[errors.length] = 'Please let us know where you went for your plant hunt.';
    }

    // kludgy way to ensure that date has a value
    // an that it's likely to have been set when list is in use
    const nyphListDate = this.get('nyphListDate');
    if (!nyphListDate) {
      this.set('nyphListDate', (new Date()).toISOString().substr(0, 10));
      this.save();
    }

    const errorsString = errors.join(' ');

    return errorsString || null;
  },

  /**
   * marks changed and saves Occurrence and parent Sample
   *
   */
  markChangedAndResave(attrs, options = {}) {
    // this.metadata.updated_on = new Date();
    // this.metadata.synced_on = null; // set when fully initialized only
    // this.metadata.server_on = null; // updated on server

    console.log('app level attributes changed, need to mark samples as unsaved.');

    return this.save(attrs, options);
  },

  /**
   *
   * @returns {string}
   */
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // eslint-disable-next-line
      const r = Math.random() * 16 | 0;
      // eslint-disable-next-line
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
});

// add previous/pased saved locations management
AppModel = AppModel.extend(pastLocationsExtension);
// add sample/occurrence attribute management
AppModel = AppModel.extend(attributeLockExtension);

const appModel = new AppModel();
export { appModel as default, AppModel };
