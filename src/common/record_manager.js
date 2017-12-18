import $ from 'jquery';
import Morel from 'morel';
import { Device, Log } from 'helpers';
import CONFIG from 'config';
import Sample from './models/sample';
import appModel from './models/app_model';
// import userModel from './models/user_model';

const morelConfiguration = $.extend(CONFIG.morel.manager, {
  Storage: Morel.DatabaseStorage,
  Sample,
  onSend(sample) {
    // if (true) {
      // attach device information
    sample.set('device', Device.getPlatform());
    sample.set('device_version', Device.getVersion());

      // attach user information
      // userModel.appendSampleUser(sample);

      // training setting
      // if (true) {
      //   sample.occurrences.at(0).set('training', false); // no more training mode
      // } else {
      //   sample.occurrences.at(0).set('training', appModel.get('useTraining'));
      // }
    // } else {
    //   // don't send until the user has logged in
    //   return true;
    // }
    return null;
  },
});

class Manager extends Morel {
  syncAll(method, collection, options = {}) {
    // if (!Device.connectionWifi()) {
    //  options.timeout = 180000; // 3 min
    // }

    options.timeout = 180000; // 3 min

    return Morel.prototype.syncAll.apply(this, [method, collection, options]);
  }

  sync(method, model, options = {}) {
    // if (!Device.connectionWifi()) {
    //  options.timeout = 180000; // 3 min
    // }

    options.timeout = 180000; // 3 min

    return Morel.prototype.sync.apply(this, [method, model, options]);
  }

  removeAllSynced(callback) {
    this.getAll((err, records) => {
      if (err) {
        Log(err, 'e');
        callback && callback(err);
        return;
      }

      let toRemove = 0;
      let noneUsed = true;

      records.each((record) => {
        if (record.getSyncStatus() === Morel.SYNCED) {
          noneUsed = false;
          toRemove++;
          record.destroy({
            success: () => {
              toRemove--;
              if (toRemove === 0) {
                callback && callback();
              }
            },
          });
        }
      });

      if (noneUsed) {
        callback && callback();
      }
    });
  }

  /**
   *
   * @param callback
   * @return Promise
   */
  setAllToSend(callback) {
    // let returnPromiseResolve;
    // let returnPromiseReject;
    return new Promise((resolve, reject) => {
      // returnPromiseResolve = resolve;
      // returnPromiseReject = reject;

      // const that = this;
      // let noneUsed = true;
      // let saving = 0;

      // validate that the top-level NYPH list details are valid
      // if (!appModel.isValid()) {

      const appModelErrors = appModel.testValidation();

      if (appModelErrors) {
        Log('app model is not valid.');
        //Log(appModel.validationError);
        Log(appModelErrors);
        reject(appModelErrors);
        // reject(appModel.validationError);
      } else {
        // validate that all samples are valid
        this.getAll((err, records) => {
          if (err) {
            Log(err, 'e');
            // callback && callback(err);

            reject(err);
            // return;
          } else {
            let toSendCount = 0;
            let notValidCount = 0;
            // const validRecords = [];

            records.each((record) => {
              // noneUsed = false;
              // saving++;
              const valid = record.setToSend((error) => {
                // if (error) {
                //   callback && callback(error);
                //   return;
                // }

                if (error) {
                  reject(error);
                  return false; // break from each()
                }

                // saving--;
                // if (saving === 0) {
                //   callback && callback();
                //
                //   // send all records remotely
                //   this.syncAll().then(() => {
                //     returnPromiseResolve();
                //   });
                // }
              });

              if (valid) {
                const syncStatus = record.getSyncStatus();

                if (syncStatus !== Morel.SYNCED) {
                  toSendCount++;
                }
              } else {
                notValidCount++;
              }

              // if (!valid) {
              //   saving--;
              // }
            });

            if (toSendCount) {
              resolve(this.syncAll());
            } else {
              if (notValidCount) {
                reject(`${notValidCount} record${(notValidCount === 1 ? ' was' : 's were')} incomplete or not valid.`);
              } else {
                reject('All your records have already been sent.');
              }
            }
          }

          // if (noneUsed || saving === 0) {
          //   callback && callback();
          // }
        });
      }
    });

    // return returnPromise;
  }

  clearAll(local, callback) {
    // const that = this;
    this.getAll((err, samples) => {
      if (window.cordova) {
        // we need to remove the images from file system
        samples.each((sample) => {
          sample.trigger('destroy');
        });
      }
      this.clear(callback);
    });
  }

  /**
   * Hacky addition of global NYPH list details
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  appendNyphListDetails(data) {
    data.append('nyphListEmail', appModel.get('nyphListEmail'));
    data.append('nyphListRecorders', appModel.get('nyphListRecorders'));
    data.append('nyphListPlacename', appModel.get('nyphListPlacename'));
    data.append('nyphListTitle', appModel.get('nyphListTitle'));
    data.append('nyphListComments', appModel.get('nyphListComments'));
    data.append('nyphListDate', appModel.get('nyphListDate'));
    data.append('nyphListUUID', appModel.get('nyphListUUID'));

    return data;
  }
}

const recordManager = new Manager(morelConfiguration);
export { recordManager as default, Manager };
