/** ****************************************************************************
 * Morel Sample.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Morel from 'morel';
import CONFIG from 'config';
import { Log } from 'helpers';
import recordManager from '../record_manager';
import Occurrence from './occurrence';
import GeolocExtension from './sample_geoloc_ext';

const Sample = Morel.Sample.extend({
  constructor(...args) {
    this.manager = recordManager;
    Morel.Sample.prototype.constructor.apply(this, args);
  },

  initialize() {
    this.set('form', CONFIG.morel.manager.input_form);
  },
  set_entry_time() {
    this.set('entry_time', new Date().toISOString());
  },

  Occurrence,

  validate(attributes) {
    const attrs = _.extend({}, this.attributes, attributes);

    const sample = {};
    const occurrences = {};

    // location
    const location = attrs.location || {};
    if (!location.latitude || !location.longitude) {
      sample.location = 'missing';
    }
    // // location name
    // if (!attrs.location_name) {
    //   sample['location name'] = 'missing';
    // }

    // if (window.nyphAdminMode) {
    //   if (!attrs.recorder) {
    //     sample.recorder = 'missing';
    //   }
    // }

    // // date
    // if (!attrs.date) {
    //   sample.date = 'missing';
    // } else {
    //   const date = new Date(attrs.date);
    //
    //   if (CONFIG.ENFORCE_DATE_CONSTRAINT) {
    //     // use NYPH constrained dates
    //
    //     if (date === 'Invalid Date' || date < CONFIG.MIN_RECORDING_DATE || date > CONFIG.MAX_RECORDING_DATE) {
    //       sample.date = (date === 'Invalid Date') ? 'invalid' : 'date is not within the permitted range';
    //     }
    //   } else if (date === 'Invalid Date' || date > new Date()) {
    //     // enforce only presence and non-future date
    //
    //     sample.date = (date === 'Invalid Date') ? 'invalid' : 'future date';
    //   }
    // }

    // location type
    if (!attrs.location_type) {
      sample.location_type = 'can\'t be blank';
    }

    // occurrences
    if (this.occurrences.length === 0) {
      sample.occurrences = 'no species selected';
    } else {
      this.occurrences.each((occurrence) => {
        let errors = occurrence.validate();

        // @todo move to occurrence module
        // don't allow 'unknown species' if no photo
        if (occurrence.images.length === 0 &&
          occurrence.get('taxon').warehouse_id === CONFIG.UNKNOWN_SPECIES.warehouse_id) {
          errors = errors || {};
          errors.taxon = 'Taxon name or photo needed';
        }

        if (errors) {
          const occurrenceID = occurrence.id || occurrence.cid;
          occurrences[occurrenceID] = errors;

          Log('error status follows');
          Log(errors);
        }
      });
    }

    if (!_.isEmpty(sample) || !_.isEmpty(occurrences)) {
      const errors = {
        sample,
        occurrences,
      };

      Log('error status follows');
      Log(errors);

      return errors;
    }

    return null;
  },

  /**
   * Mark the record for submission and store it locally
   */
  setToSend(callback) {
    this.metadata.saved = true;

    if (!this.isValid()) {
      // since the sample was invalid and so was not saved
      // we need to revert it's status
      this.metadata.saved = false;
      return false;
    }

    // save record (does not send remotely)
    const promise = this.save(null, {
      success: () => {
        callback && callback();
      },
      error: (err) => {
        callback && callback(err);
      },
    });

    return promise;
  },

  // isLocalOnly appears never to be called
  // isLocalOnly() {
  //   const status = this.getSyncStatus();
  //   if (this.metadata.saved && (
  //     status === Morel.LOCAL ||
  //     status === Morel.SYNCHRONISING)) {
  //     return true;
  //   }
  //   return false;
  // },
}).extend(GeolocExtension); // add geolocation functionality

$.extend(true, Morel.Sample.keys, CONFIG.morel.sample);
export { Sample as default };
