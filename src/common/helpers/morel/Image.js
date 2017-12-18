/** *********************************************************************
 * IMAGE
 **********************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import helpers from './helpers';
import Error from './Error';
import CONST from './constants';

const THUMBNAIL_WIDTH = 100; // px
const THUMBNAIL_HEIGHT = 100; // px

const ImageModel = Backbone.Model.extend({
  constructor(attributes = {}, options = {}) {
    let attrs = attributes;
    if (typeof attributes === 'string') {
      const data = attributes;
      attrs = { data };
      return;
    }

    this.cid = options.cid || options.id || helpers.getNewUUID();
    this.setOccurrence(options.occurrence || this.occurrence);

    this.attributes = {};
    if (options.collection) {
      this.collection = options.collection;
    }
    if (options.parse) {
      attrs = this.parse(attrs, options) || {};
    }
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};

    if (options.metadata) {
      this.metadata = options.metadata;
    } else {
      const today = new Date();
      this.metadata = {
        created_on: today,
        updated_on: today,

        synced_on: null, // set when fully initialized only
        server_on: null, // updated on server
      };
    }

    this.initialize.apply(this, arguments);
  },

  /**
   * marks changed and saves Occurrence and parent Sample
   *
   */
  markChangedAndResave(attrs, options = {}) {
    if (!this.occurrence) {
      return false;
    }

    this.metadata.updated_on = new Date();
    this.metadata.synced_on = null; // set when fully initialized only
    this.metadata.server_on = null; // updated on server

    return this.occurrence.markChangedAndResave(attrs, options);
  },

  save(attrs, options = {}) {
    if (!this.occurrence) {
      return false;
    }
    return this.occurrence.save(attrs, options);
  },

  /**
   * Sync statuses:
   * synchronising, synced, local, server, changed_locally, changed_server, conflict
   */
  getSyncStatus() {
    const meta = this.metadata;
    // on server
    if (this.synchronising) {
      return CONST.SYNCHRONISING;
    }

    if (meta.synced_on) {
      // changed_locally
      if (meta.synced_on < meta.updated_on) {
        // changed_server - conflict!
        if (meta.synced_on < meta.server_on) {
          return CONST.CONFLICT;
        }
        return CONST.CHANGED_LOCALLY;
        // changed_server
      } else if (meta.synced_on < meta.server_on) {
        return CONST.CHANGED_SERVER;
      }
      return CONST.SYNCED;
    }

    // default to local only
    return CONST.LOCAL;
  },

  destroy(options = {}) {
    const dfd = new $.Deferred();

    // removes from all collections etc
    this.stopListening();
    this.trigger('destroy', this, this.collection, options);

    if (this.occurrence && !options.noSave) {
      const success = options.success;
      options.success = () => {
        dfd.resolve();
        success && success();
      };

      // save the changes permanently
      // was this.save(null, options);
      this.markChangedAndResave(null, options);
    } else {
      dfd.resolve();
      options.success && options.success();
    }

    return dfd.promise();
  },

  /**
   * Returns image's absolute URL or dataURI.
   */
  getURL() {
    return this.get('data');
  },

  /**
   * Sets parent Occurrence.
   * @param occurrence
   */
  setOccurrence(occurrence) {
    if (!occurrence) return;

    const that = this;
    this.occurrence = occurrence;
    this.occurrence.on('destroy', () => {
      that.destroy({ noSave: true });
    });
  },

  // /**
  //  * Resizes itself.
  //  */
  // resize(MAX_WIDTH, MAX_HEIGHT, callback) {
  //   const that = this;
  //   ImageModel.resize(this.getURL(), this.get('type'), MAX_WIDTH, MAX_HEIGHT,
  //     (err, data, image) => {
  //       if (err) {
  //         callback && callback(err);
  //         return;
  //       }
  //       that.set('data', data);
  //       callback && callback(null, image, data);
  //     });
  // },

  /**
   * Adds a thumbnail to image model.
   * @param callback
   * @param options
   */
  addThumbnail(callback, options = {}) {
    const that = this;
    // check if data source is dataURI

    // const re = /^data:/i;
    // const fullsizeData = this.get('data');

    // if (re.test(fullsizeData)) {
    ImageModel.resize(
        this.get('data'), // fullsizeData, // this.getURL(),
        this.get('type'),
        THUMBNAIL_WIDTH || options.width,
        THUMBNAIL_WIDTH || options.width,
        (err, data) => {
          that.set('thumbnail', data);
          callback && callback();
        });
    // } else {
    //   ImageModel.getDataURI(fullsizeData, (err, data) => {
    //     that.set('thumbnail', data);
    //     callback && callback();
    //   }, {
    //     width: THUMBNAIL_WIDTH || options.width,
    //     height: THUMBNAIL_HEIGHT || options.height,
    //   });
    // }
  },

  toJSON() {
    const data = {
      id: this.id,
      metadata: this.metadata,
      attributes: this.attributes,
    };
    return data;
  },
});

_.extend(ImageModel, {
  /**
   * Transforms and resizes an image file into a string.
   * Can accept file image path and a file input file.
   *
   * @param onError
   * @param file
   * @param onSaveSuccess
   * @returns {number}
   */
  getDataURI(file, callback, options = {}) {
    // file paths
    if (typeof file === 'string') {
      // get extension
      let fileType = file.replace(/.*\.([a-z]+)$/i, '$1');
      if (fileType === 'jpg') {
        // to match media types image/jpeg
        fileType = 'jpeg';
      }

      ImageModel.resize(file, fileType, options.width, options.height, (err, dataURI, image) => {
        callback(null, dataURI, fileType, image.width, image.height);
      });
    } else {
      // file inputs
      if (!window.FileReader) {
        const message = 'No File Reader';
        const error = new Error(message);
        console.error(message);

        callback(error);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        if (options.width || options.height) {
          // resize
          ImageModel.resize(
            event.target.result,
            file.type,
            options.width,
            options.height,
            (err, dataURI, image) => {
              callback(null, dataURI, file.type, image.width, image.height);
            }
            );
        } else {
          // event.target.result already contains a data uri string
          // if got here by taking a photo
          // why create an Image?
          // is it just to get width and height

          // file.type is already set to string 'image/jpeg'

          const type = file.type.replace(/.*\/([a-z]+)$/i, '$1');

          // width and height are not set properly
          // but appear never to be used anyway
          callback(null, event.target.result, type, null, null);

          // const image = new window.Image(); // native one
          //
          // image.onload = () => {
          //   const type = file.type.replace(/.*\/([a-z]+)$/i, '$1');
          //   callback(null, event.target.result, type, image.width, image.height);
          // };
          // image.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  },

  /**
   * http://stackoverflow.com/questions/2516117/how-to-scale-an-image-in-data-uri-format-in-javascript-real-scaling-not-usin
   * @param {string} data
   * @param {number} width
   * @param {number} height
   * @param callback
   */
  resize(data, fileType, MAX_WIDTH, MAX_HEIGHT, callback) {
    const image = new window.Image(); // native one

    image.onload = () => {
      let width = image.width;
      let height = image.height;
      const maxWidth = MAX_WIDTH || width;
      const maxHeight = MAX_HEIGHT || height;

      let canvas = null;
      let res = null;

      // resizing
      if (width > height) {
        res = width / maxWidth;
      } else {
        res = height / maxHeight;
      }

      width /= res;
      height /= res;

      // Create a canvas with the desired dimensions
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Scale and draw the source image to the canvas
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);

      // Convert the canvas to a data URL in some format
      callback(null, canvas.toDataURL(fileType), image);
    };

    image.src = data;
  },
});

export { ImageModel as default };