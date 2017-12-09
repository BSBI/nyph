/** ****************************************************************************
 * Record List controller.
 *****************************************************************************/
import Morel from 'morel';
import App from 'app';
import CONFIG from 'config';
import { Log, Analytics, ImageHelp } from 'helpers';
import appModel from '../../common/models/app_model';
// import userModel from '../../common/models/user_model';
import recordManager from '../../common/record_manager';
import Sample from '../../common/models/sample';
import Occurrence from '../../common/models/occurrence';
import MainView from './list_main_view';
import HeaderView from './header_view';
import LoaderView from '../../common/views/loader_view';

const RecordListController = {
  show() {
    const loaderView = new LoaderView();
    App.regions.getRegion('main').show(loaderView);

    // recordsCollection is a set of Samples
    recordManager.getAll((getError, recordsCollection) => {
      Log('Records:List:Controller: showing');
      if (getError) {
        Log(getError, 'e');
        App.regions.getRegion('dialog').error(getError);
        return;
      }

      // MAIN
      const mainView = new MainView({
        collection: recordsCollection,
        appModel,
      });

      mainView.on('childview:record:edit:attr', (model, attr) => {
        App.trigger('records:edit:attr', model.id || model.cid, attr);
      });

      mainView.on('childview:record:delete', (childView) => {
        const recordModel = childView.model;
        RecordListController.recordDelete(recordModel);
      });

      App.regions.getRegion('main').show(mainView);
    });

    // HEADER
    const headerView = new HeaderView({ model: appModel });
    headerView.on('records:submit:all', RecordListController.showSendAllDialog);

    headerView.on('photo:upload', (e) => {
      const photo = e.target.files[0];
      RecordListController.photoUpload(photo);
    });

    // android gallery/camera selection
    headerView.on('photo:selection', RecordListController.photoSelect);

    App.regions.getRegion('header').show(headerView);

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
  },

  onExit(mainView, recordModel, attr, callback) {
    Log('Records:List:Controller: exiting');
        // const values = mainView.getValues();
        // RecordListController.save(attr, values, recordModel, callback);
  },

  recordDelete(recordModel) {
    Log('Records:List:Controller: deleting record');

    const syncStatus = recordModel.getSyncStatus();
    let body = 'This record hasn\'t been saved to iRecord yet, ' +
      'are you sure you want to remove it from your device?';

    if (syncStatus === Morel.SYNCED) {
      body = 'Are you sure you want to remove this record from your device?';
      body += '</br><i><b>Note:</b> it will remain on the server.</i>';
    }
    App.regions.getRegion('dialog').show({
      title: 'Delete',
      body,
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            App.regions.getRegion('dialog').hide();
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            recordModel.destroy();
            App.regions.getRegion('dialog').hide();
            Analytics.trackEvent('List', 'record remove');
          },
        },
      ],
    });
  },

  photoUpload(photo) {
    Log('Records:List:Controller: photo upload');

    // show loader
    RecordListController.createNewRecord(photo, () => {
      // hide loader
    });
  },

  photoSelect() {
    Log('Records:List:Controller: photo select');

    App.regions.getRegion('dialog').show({
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage((entry) => {
              RecordListController.createNewRecord(entry.nativeURL, () => {});
            });
            App.regions.getRegion('dialog').hide();
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              RecordListController.createNewRecord(entry.nativeURL, () => {});
            }, {
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            });
            App.regions.getRegion('dialog').hide();
          },
        },
      ],
    });
  },

  /**
   * Creates a new record with an image passed as an argument.
   */
  createNewRecord(photo, callback) {
    ImageHelp.getImageModel(photo, (err, image) => {
      if (err || !image) {
        callback(new Error('Missing image.'));
        return;
      }
      const occurrence = new Occurrence({
        taxon: Object.assign({}, CONFIG.UNKNOWN_SPECIES),
      });
      occurrence.addImage(image);

      const sample = new Sample();
      sample.addOccurrence(occurrence);
      sample.set_entry_time();

      // append locked attributes
      appModel.appendAttrLocks(sample);

      recordManager.set(sample, (saveErr) => {
        if (saveErr) {
          callback(saveErr);
          return;
        }
        // check if location attr is not locked
        const locks = appModel.get('attrLocks');

        if (!locks.location) {
          // no previous location
          sample.startGPS();
        } else if (!locks.location.latitude || !locks.location.longitude) {
          // previously locked location was through GPS
          // so try again
          sample.startGPS();
        }
        callback();
      });
    });
  },

  showSendAllDialog() {
    App.regions.getRegion('dialog').show({
      title: 'Submit All',
      body: 'Are you sure you want to set all valid records for submission?',
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            App.regions.getRegion('dialog').hide();
          },
        },
        {
          title: 'OK',
          class: 'btn-positive',
          onClick: RecordListController.sendAllRecords,
        },
      ],
    });
  },

  showIncompleteDialog() {
    App.regions.getRegion('dialog').show({
      title: 'Sorry',
      body: 'Some records could not be submitted at the moment. ' +
      'Try again later',
    });
  },

  showThanksDialog() {
    App.regions.getRegion('dialog').show({
      title: 'Thank you!',
      body: 'Follow progress at <a href="https://nyph.bsbi.org" target="_blank">nyph.bsbi.org</a>',
      buttons: [
        {
          title: 'OK',
          class: 'btn-positive',
          onClick() {
            App.regions.getRegion('dialog').hide();
          },
        },
      ],
    });
  },

  sendAllRecords() {
    Log('Settings:Menu:Controller: sending all records');

    // try to send all records
    recordManager.setAllToSend((err) => {
      if (err) {
        App.regions.getRegion('dialog').error(err);
        return;
      }
      App.regions.getRegion('dialog').hide();
    }).then(() => {
      // check if there are any unsent changes
      // retrieve the records again and check that all are marked as synch'ed

      let incomplete = false;
      recordManager.getAll((err, records) => {
        if (err) {
          Log(err, 'e');
          return;
        }
        records.each((record) => {
          const status = record.getSyncStatus();
          if (record.metadata.saved && status !== Morel.SYNCED) {
            incomplete = true;
          }
        });

        // give feedback
        if (incomplete) {
          RecordListController.showIncompleteDialog();
        } else {
          RecordListController.showThanksDialog();
        }
      });
    });
  },
};

export { RecordListController as default };
