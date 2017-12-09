/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import Backbone from 'backbone';
import Store from 'backbone.localstorage';
import CONFIG from 'config';
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
      this.set('nyphListUUID', this.uuid());
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
