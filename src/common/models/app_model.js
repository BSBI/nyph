/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import CONFIG from 'config';
import { Validate, Log } from 'helpers';
import userModel from './user_model';
import pastLocationsExtension from './app_model_past_loc_ext';
import attributeLockExtension from './app_model_attr_lock_ext';

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

    const currentNyphListUUID = this.get('nyphListUUID');
    if (!currentNyphListUUID) {
      //this.set('nyphListUUID', this.uuid());
      this.setUuid();
      this.save();
    }

    // attr lock recorder on login
    userModel.on('login logout', () => {
      if (userModel.hasLogIn()) {
        if (!window.nyphAdminMode) {
            // only set and lock recorder name for normal user
            // and not for the generic Plant Hunt admin account

          const surname = userModel.get('surname');
          const name = userModel.get('name');
          const recorder = `${surname}, ${name}`;
          this.setAttrLock('recorder', recorder);
        }
      } else {
        this.unsetAttrLock('recorder');
      }
    });
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
