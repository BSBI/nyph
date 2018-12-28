import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Sample from './Sample';
import Occurrence from './Occurrence';
import Storage from './Storage';
import DatabaseStorage from './DatabaseStorage';
import LocalStorage from './LocalStorage';
import ImageModel from './Image';
import Error from './Error';
import CONST from './constants';
import helpers from './helpers';
// import appModel from '../../models/app_model';

class Morel {
  constructor(options = {}) {
    this.options = options;

    this.storage = new Storage({
      appname: options.appname,
      Sample: options.Sample,
      Storage: options.Storage,
      manager: this,
    });
    this.onSend = options.onSend;
    this._attachListeners();
    this.synchronising = false;
  }

  // storage functions
  get(model, callback, options) {
    this.storage.get(model, callback, options);
  }

  getAll(callback, options) {
    this.storage.getAll(callback, options);
  }

  set(model, callback, options) {
    model.manager = this; // set the manager on new model
    this.storage.set(model, callback, options);
  }

  remove(model, callback, options) {
    this.storage.remove(model, callback, options);
  }

  has(model, callback, options) {
    this.storage.has(model, callback, options);
  }

  clear(callback, options) {
    this.storage.clear(callback, options);
  }

  /**
   * Synchronises a collection
   * if collection is undefined then sync everything
   *
   * @param method
   * @param collection
   * @param options
   * @returns {*}
   */
  syncAll(method, collection, options = {}) {

    // based on https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e

    const promiseSerial = funcs =>
      funcs.reduce((promise, func) =>
          promise.then(result => func().then(Array.prototype.concat.bind(result))),
          (new $.Deferred()).resolve([])
        );

    // return an array of promise factories
    const mapFactories = function (collection) {
      return collection.map(model => {
        const syncStatus = model.getSyncStatus();

        if (syncStatus !== CONST.SYNCED) {
          return function() {
            console.log(`syncing ${model.id} or ${model.cid}`);
            return model.save(null, {
              remote: true,
              timeout: options.timeout,
            }); // return a promise
          };
        } else {
          return function (){
            const passingPromise = new $.Deferred();
            return passingPromise.resolve();
          };
        }
      });
    };

    let returnPromise = null;

    if (collection) {
      returnPromise = promiseSerial(mapFactories(collection));
    } else {
      returnPromise = new $.Deferred;

      // get all models to submit
      this.getAll((err, receivedCollection) => {
        if (err) {
          returnPromise.reject();
          options.error && options.error(err);
          return;
        }

        // @todo should include early test to prevent resync of unmodified
        returnPromise = promiseSerial(mapFactories(receivedCollection));
      });
    }

    return returnPromise.then(() => {
      console.log('reached success point');
      options.success && options.success()
    }).promise();


    // const returnPromise = new $.Deferred();

    // sync all in collection
    // function syncEach(collectionToSync) {
    //   const toWait = [];
    //   collectionToSync.each((model) => {
    //     // todo: reuse the passed options model
    //
    //     const syncStatus = model.getSyncStatus();
    //
    //     if (syncStatus !== CONST.SYNCED) {
    //       const promise = model.save(null, {
    //         remote: true,
    //         timeout: options.timeout,
    //       });
    //       const passingPromise = new $.Deferred();
    //       if (!promise) {
    //         // model was invalid
    //         passingPromise.resolve();
    //       } else {
    //         // valid model, but in case it fails sync carry on
    //         promise.always(() => {
    //           passingPromise.resolve();
    //         });
    //       }
    //       toWait.push(passingPromise);
    //     } else {
    //       console.log(`already synch'ed ${model.id} or ${model.cid}`);
    //     }
    //   });
    //
    //   const dfd = $.when(...toWait);
    //
    //   dfd.then(() => {
    //     returnPromise.resolve();
    //     options.success && options.success();
    //   });
    // }
    //
    // return returnPromise.promise();
  }

  /**
   * Synchronises a collection
   * if collection is undefined then sync everything
   *
   * @param method
   * @param collection
   * @param options
   * @returns {*}
   */
  syncAll_OLD(method, collection, options = {}) {
    const returnPromise = new $.Deferred();

    // sync all in collection
    function syncEach(collectionToSync) {
      const toWait = [];
      collectionToSync.each((model) => {
        // todo: reuse the passed options model

        const syncStatus = model.getSyncStatus();

        if (syncStatus !== CONST.SYNCED) {
          const promise = model.save(null, {
            remote: true,
            timeout: options.timeout,
          });
          const passingPromise = new $.Deferred();
          if (!promise) {
            // model was invalid
            passingPromise.resolve();
          } else {
            // valid model, but in case it fails sync carry on
            promise.always(() => {
              passingPromise.resolve();
            });
          }
          toWait.push(passingPromise);
        } else {
          console.log(`already synch'ed ${model.id} or ${model.cid}`);
        }
      });

      const dfd = $.when(...toWait);

      // // should fire these sequentially not simultaneously
      // const dfd = Promise.resolve();
      // for (let i = 0; i < toWait.length; i++) {
      //   (function (n) {
      //     dfd.then(function () {
      //       return Promise.resolve(toWait[n]);
      //     });
      //   })(i);
      // }

      dfd.then(() => {
        returnPromise.resolve();
        options.success && options.success();
      });
    }

    if (collection) {
      syncEach(collection);
    } else {
      // get all models to submit
      this.getAll((err, receivedCollection) => {
        if (err) {
          returnPromise.reject();
          options.error && options.error(err);
          return;
        }

        // @todo should include early test to prevent resync of unmodified

        syncEach(receivedCollection);
      });
    }
    return returnPromise.promise();
  }

  /**
   * Synchronises the model with the remote server.
   *
   * @param method
   * @param model
   * @param options
   */
  sync(method, model, options = {}) {
    const syncStatus = model.getSyncStatus();

    // don't resend
    if (syncStatus === CONST.SYNCED ||
      syncStatus === CONST.SYNCHRONISING) {
      return false;
    }

    options.url = model.manager.options.url; // get the URL

    // on success update the model and save to local storage
    const success = options.success;
    options.success = (successModel) => {
      successModel.save().then(() => {
        successModel.trigger('sync');
        success && success();
      });
    };

    // why not model.manager.post(model, options)
    const xhr = Morel.prototype.post.apply(model.manager, [model, options]);

    return xhr;
  }

  /**
   * Posts a record to remote server.
   * @param model
   * @param options
   */
  post(model, options) {
    // call user defined onSend function to modify
    const onSend = model.onSend || this.onSend;
    const stopSending = onSend && onSend(model);
    if (stopSending) {
      // return since user says invalid
      return false;
    }

    model.synchronising = true;

      // on success
    const success = options.success;
    options.success = () => {
      model.synchronising = false;

      // update model
      model.metadata.warehouse_id = 1;
      model.metadata.server_on =
          model.metadata.updated_on =
            model.metadata.synced_on = new Date();

      // mark associated images as synch'ed
      model.occurrences.each((occurrence) => {
        if (occurrence.images) {
          occurrence.images.each((image) => {
            image.metadata.server_on =
              image.metadata.updated_on =
                image.metadata.synced_on = new Date();

            image.save();
          });
        }
      });

      success && success(model, null, options);
    };

    // on error
    const error = options.error;
    options.error = (xhr, textStatus, errorThrown) => {
      model.synchronising = false;
      model.trigger('error');

      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    const dfd = new $.Deferred();
    this._getModelFormData(model, (err, formData) => {
        // AJAX post
      const xhr = options.xhr = Backbone.ajax({
        url: options.url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        timeout: options.timeout || 900000, // 15 mins
        success: options.success,
        error: options.error,
      });

      xhr.done((data, textStatus, jqXHR) => {
        dfd.resolve(data, textStatus, jqXHR);
      });
      xhr.fail((jqXHR, textStatus, errorThrown) => {
        dfd.reject(jqXHR, textStatus, errorThrown);
      });
      model.trigger('request', model, xhr, options);
    });

    return dfd.promise();
  }

  _attachListeners() {
    const that = this;
    this.storage.on('update', () => {
      that.trigger('update');
    });
  }

  _getModelFormData(model, callback) {
    const flattened = model.flatten(this._flattener);
    let formData = new FormData();

    // append images
    let occCount = 0;
    const occurrenceProcesses = [];
    model.occurrences.each((occurrence) => {
      // on async run occCount will be incremented before used for image name
      // const localOccCount = occCount;
      let imgCount = 0;

      const imageProcesses = [];

      occurrence.images.each((image) => {
        // add external ID
        const imageId = image.cid || image.id;
        if (imageId) {
          flattened[`photoid[${imgCount}]`] = imageId;
        }

        const imageSyncStatus = image.getSyncStatus();
        if (imageSyncStatus !== CONST.SYNCED && imageSyncStatus !== CONST.SYNCHRONISING) {
          // need to send image

          const imageDfd = new $.Deferred();
          imageProcesses.push(imageDfd);

          const url = image.getURL();
          const type = image.get('type');

          const onSuccess = function (err, img, dataURI, blob) {
            // const name = `sc:${localOccCount}::photo${imgCount}`;
            const name = imageId;

            // can provide both image/jpeg and jpeg
            let extension = type;
            let mediaType = type;
            if (type.match(/image.*/)) {
              extension = type.split('/')[1];
            } else {
              mediaType = `image/${mediaType}`;
            }
            if (!blob) {
              blob = helpers.dataURItoBlob(dataURI, mediaType);
            }

            formData.append(name, blob, `pic.${extension}`);
            imgCount++;
            imageDfd.resolve();
          };

          if (!helpers.isDataURL(url)) {
            // load image
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = () => {
              onSuccess(null, null, null, xhr.response);
            };

            xhr.send();
          } else {
            onSuccess(null, null, url);
          }
        }
      });

      occurrenceProcesses.push($.when(...imageProcesses));
      occCount++;
    });

    $.when(...occurrenceProcesses).then(() => {
      // append attributes
      const keys = Object.keys(flattened);
      for (let i = 0; i < keys.length; i++) {
        formData.append(keys[i], flattened[keys[i]]);
      }

      // Add authentication
      // formData = this.appendAuth(formData);

      // Add NYPH list-level attributes
      // (a hacky approach because these are not part of an Indicia object)
      formData = this.appendNyphListDetails(formData);

      callback(null, formData);
    });
  }

  _flattener(attributes, options) {
    const flattened = options.flattened || {};
    const keys = options.keys || {};
    const count = options.count;
    let attr = null;
    let name = null;
    let value = null;
    let prefix = '';
    let native = 'sample_';
    // let custom = 'smpAttr:';

    if (this instanceof Occurrence) {
      prefix = 'sc:';
      native = 'occurrence_';
      // custom = '::occAttr:';
    }

    // add external ID
    const id = this.cid || this.id;
    if (id) {
      if (this instanceof Occurrence) {
        //flattened[`${prefix + count + native}external_key`] = id;
        flattened[`${native}external_key`] = id;
      } else {
        flattened[`${native}external_key`] = this.cid || this.id;
      }
    }

    for (attr in attributes) {
      if (!keys[attr]) {
        if (attr !== 'email' && attr !== 'usersecret') {
          console.warn(`Morel: no such key: ${attr}`);
        }
        flattened[attr] = attributes[attr];
        continue;
      }

      name = keys[attr].id;

      if (!name) {
        // name = `${prefix + count}::${attr}`;
        name = attr;
      } else {
        if (parseInt(name, 10) >= 0) {
          // name = custom + name;
          name = attr;
        } else {
          name = native + name;
        }

        if (prefix) {
          name = prefix + count + name;
        }
      }

      // no need to send undefined
      // if (!attributes[attr]) continue;

      value = attributes[attr];

      // check if has values to choose from
      if (keys[attr].values) {
        if (typeof keys[attr].values === 'function') {
          const fullOptions = _.extend(options, {
            flattener: Morel.prototype._flattener,
            flattened,
          });

          // get a value from a function
          value = keys[attr].values(value, fullOptions);
        } else {
          value = keys[attr].values[value];
        }
      }

      // don't need to send null or undefined
      if (value) {
        flattened[name] = value;
      } else {
        flattened[name] = null;
      }
    }

    return flattened;
  }

  // /**
  //  * Appends user and app authentication to the passed data object.
  //  * Note: object has to implement 'append' method.
  //  *
  //  * @param data An object to modify
  //  * @returns {*} A data object
  //  */
  // appendAuth(data) {
  //   // app logins
  //   this._appendAppAuth(data);
  //   // warehouse data
  //   this._appendWarehouseAuth(data);
  //
  //   return data;
  // }

  /**
   * Hacky addition of global NYPH list details
   * this should be overriden by RecordManager
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  appendNyphListDetails(data) {
    data.append('foo', 'bar');

    return data;
  }

  /**
   * Appends app authentication - Appname and Appsecret to
   * the passed object.
   * Note: object has to implement 'append' method.
   *
   * @param data An object to modify
   * @returns {*} A data object
   */
  _appendAppAuth(data) {
    data.append('appname', this.options.appname);
    data.append('appsecret', this.options.appsecret);

    return data;
  }

  /**
   * Appends warehouse related information - website_id and survey_id to
   * the passed data object.
   * Note: object has to implement 'append' method.
   *
   * This is necessary because the data must be associated to some
   * website and survey in the warehouse.
   *
   * @param data An object to modify
   * @returns {*} An data object
   */
  _appendWarehouseAuth(data) {
    data.append('website_id', this.options.website_id);
    data.append('survey_id', this.options.survey_id);

    return data;
  }
}

_.extend(Morel.prototype, Backbone.Events);

_.extend(Morel, CONST, {
  VERSION: '0', // library version, generated/replaced by grunt

  Sample,
  Occurrence,
  DatabaseStorage,
  LocalStorage,
  Image: ImageModel,
  Error,
});

export { Morel as default };
