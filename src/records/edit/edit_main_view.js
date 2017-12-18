/** ****************************************************************************
 * Record Edit main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Morel from 'morel';
import JST from 'JST';
import { StringHelp } from 'helpers';
// import CONFIG from 'config';

import './styles.scss';

export default Marionette.View.extend({
  template: JST['records/edit/edit_main'],

  initialize() {
    // fix zIndex bug if navigating back from maps view
    // as Marionette doesn't play well with chrome's back button
    document.getElementById('main').style.zIndex = 'auto';

    const recordModel = this.model.get('recordModel');
    this.listenTo(recordModel, 'request sync error geolocation', this.render);
  },

  serializeData() {
    // recordModel is Sample
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.occurrences.at(0);
    const taxonDescriptor = occ.get('taxon') || {};
    const appModel = this.model.get('appModel');

    // taxon
    const scientificName = taxonDescriptor.qname;
    const commonName = taxonDescriptor.vernacular;

    // const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};
    // const location_name = recordModel.get('location_name');

    // const attrLocks = {
    //   // date: appModel.isAttrLocked('date', recordModel.get('date')),
    //   location: appModel.isAttrLocked('location', recordModel.get('location')),
    //   location_name: appModel.isAttrLocked('location_name', recordModel.get('location_name')),
    //   // recorder: appModel.isAttrLocked('recorder', recordModel.get('recorder')),
    //   // comment: appModel.isAttrLocked('comment', occ.get('comment')),
    // };

    // regardless of CONFIG.ENFORCE_DATE_CONSTRAINT flag date range problems in UI
    // const modelDate = new Date(recordModel.get('date'));

    return {
      id: recordModel.id || recordModel.cid,
      scientificName,
      commonName,
      taxonDescriptor,
      isLocating: recordModel.isGPSRunning(),
      isSynchronising: recordModel.getSyncStatus() === Morel.SYNCHRONISING,
      gridref: location.gridref,
      gridrefLock: appModel.lockGridref,
      // location: locationPrint,
      // location_name: location_name,
      comment: occ.get('comment') && StringHelp.escape(occ.get('comment')),
      // locks: attrLocks,

    };
  },
});
