/** ****************************************************************************
 * NYPH List additional details controller.
 *
 * allows lists to be explicitly titled,
 * given a different date
 * given overview notes
 *****************************************************************************/
// import Marionette from 'backbone.marionette';
// import Backbone from 'backbone';
// import _ from 'lodash';
// import Morel from 'morel';
import { Log } from 'helpers';
// import { Device, ImageHelp, Analytics, Log, StringHelp, Validate } from 'helpers';
import App from 'app';
import appModel from '../../common/models/app_model';
// import userModel from '../../common/models/user_model';
// import recordManager from '../../common/record_manager';
import MainView from './details_main_view';
import HeaderView from './details_header_view';
import recordManager from '../../common/record_manager';
// import FooterView from './details_footer_view';

const API = {
  show() {
    Log('Records:Details:Controller: showing');

      // MAIN
    const mainView = new MainView({
      model: appModel,
    });
    App.regions.getRegion('main').show(mainView);

      // HEADER
    const headerView = new HeaderView({
      model: appModel, // unsure if this is needed
    });

    App.regions.getRegion('header').show(headerView);

      // FOOTER
    App.regions.getRegion('footer').hide().empty();
    // const footerView = new FooterView({
    //   model: appModel, // unsure if this is needed
    // });

    // save for later in case want option for adding group selfies
    // footerView.on('photo:upload', (e) => {
    //   const photo = e.target.files[0];
    //   API.photoUpload(recordModel, photo);
    // });

    // footerView.on('childview:photo:delete', (view) => {
    //   const photo = view.model;
    //   API.photoDelete(photo);
    // });

    // android gallery/camera selection
    // footerView.on('photo:selection', () => {
    //   API.photoSelect(recordModel);
    // });

    // App.regions.getRegion('footer').show(footerView);

    mainView.on('details:attribute:change', () => {
      console.log('details:attribute:change');

      appModel.save();

      recordManager.getAll((getError, recordsCollection) => {
        // if a top-level list attribute changes then
        // unfortunately all the samples need to be marked as changed.
        recordsCollection.each((sample) => {
          sample.markChangedAndResave();
        });
      });
    });
  },


  // showInvalidsMessage(invalids) {
  //   delete invalids.sample.saved; // it wasn't saved so of course this error
  //
  //   let missing = '';
  //   if (invalids.occurrences) {
  //     _.each(invalids.occurrences, (message, invalid) => {
  //       missing += `<b>${invalid}</b> - ${message}</br>`;
  //     });
  //   }
  //   if (invalids.sample) {
  //     _.each(invalids.sample, (message, invalid) => {
  //       missing += `<b>${invalid}</b> - ${message}</br>`;
  //     });
  //   }
  //
  //   App.regions.getRegion('dialog').show({
  //     title: 'Sorry',
  //     body: missing,
  //     timeout: 2000,
  //   });
  // },

  // photoUpload(recordModel, photo) {
  //   Log('Records:Edit:Controller: photo uploaded');
  //
  //   const occurrence = recordModel.occurrences.at(0);
  //   // show loader
  //   API.addPhoto(occurrence, photo, (occErr) => {
  //     // hide loader
  //     if (occErr) {
  //       App.regions.getRegion('dialog').error(occErr);
  //     }
  //   });
  // },

  // photoDelete(photo) {
  //   App.regions.getRegion('dialog').show({
  //     title: 'Delete',
  //     body: 'Are you sure you want to remove this photo from the record?' +
  //     '</br><i><b>Note:</b> it will remain in the gallery.</i>',
  //     buttons: [
  //       {
  //         title: 'Cancel',
  //         onClick() {
  //           App.regions.getRegion('dialog').hide();
  //         },
  //       },
  //       {
  //         title: 'Delete',
  //         class: 'btn-negative',
  //         onClick() {
  //           // show loader
  //           photo.destroy({
  //             success: () => {
  //               Log('Records:Edit:Controller: photo deleted');
  //
  //               // hide loader
  //             },
  //           });
  //           App.regions.getRegion('dialog').hide();
  //           Analytics.trackEvent('Record', 'photo remove');
  //         },
  //       },
  //     ],
  //   });
  // },

  // photoSelect(recordModel) {
  //   Log('Records:Edit:Controller: photo selection');
  //   const occurrence = recordModel.occurrences.at(0);
  //
  //   App.regions.getRegion('dialog').show({
  //     title: 'Choose a method to upload a photo',
  //     buttons: [
  //       {
  //         title: 'Camera',
  //         onClick() {
  //           ImageHelp.getImage((entry) => {
  //             API.addPhoto(occurrence, entry.nativeURL, (occErr) => {
  //               if (occErr) {
  //                 App.regions.getRegion('dialog').error(occErr);
  //               }
  //             });
  //           });
  //           App.regions.getRegion('dialog').hide();
  //         },
  //       },
  //       {
  //         title: 'Gallery',
  //         onClick() {
  //           ImageHelp.getImage((entry) => {
  //             API.addPhoto(occurrence, entry.nativeURL, (occErr) => {
  //               if (occErr) {
  //                 App.regions.getRegion('dialog').error(occErr);
  //               }
  //             });
  //           }, {
  //             sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
  //             saveToPhotoAlbum: false,
  //           });
  //           App.regions.getRegion('dialog').hide();
  //         },
  //       },
  //     ],
  //   });
  // },

  // /**
  //  * Adds a new image to occurrence.
  //  */
  // addPhoto(occurrence, photo, callback) {
  //   ImageHelp.getImageModel(photo, (err, image) => {
  //     if (err || !image) {
  //       const error = new Error('Missing image.');
  //       callback(error);
  //       return;
  //     }
  //     occurrence.addImage(image);
  //
  //     occurrence.save(null, {
  //       success: () => {
  //         callback();
  //       },
  //       error: (error) => {
  //         Log(error, 'e');
  //         callback(error);
  //       },
  //     });
  //   });
  // },
};

export { API as default };
