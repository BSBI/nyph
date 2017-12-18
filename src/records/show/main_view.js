/** ****************************************************************************
 * Record Show main view.
 *****************************************************************************/
import Morel from 'morel';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import { DateHelp } from 'helpers';
import Gallery from '../../common/gallery';
import './styles.scss';

export default Marionette.View.extend({
  template: JST['records/show/main'],

  events: {
    'click img': 'photoView',
  },

  initialize() {
    // fix zIndex bug if navigating back from maps view
    // as Marionette doesn't play well with chrome's back button
    document.getElementById('main').style.zIndex = 'auto';
  },

  photoView(e) {
    e.preventDefault();

    const items = [];
    const recordModel = this.model.get('recordModel');
    recordModel.occurrences.at(0).images.each((image) => {
      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

// Initializes and opens PhotoSwipe
    const gallery = new Gallery(items);
    gallery.init();
  },

  serializeData() {
    const recordModel = this.model.get('recordModel');
    const occ = recordModel.occurrences.at(0);
    const species = occ.get('taxon');

    // taxon
    const scientificName = species.scientific_name;
    const commonName = species.common_name;

    const syncStatus = recordModel.getSyncStatus();

    const locationPrint = recordModel.printLocation();
    // const location = recordModel.get('location') || {};
    const location_name = recordModel.get('location_name');

    return {
      id: occ.cid,
      isSynchronising: syncStatus === Morel.SYNCHRONISING,
      onDatabase: syncStatus === Morel.SYNCED,
      scientific_name: scientificName,
      commonName,
      location: locationPrint,
      location_name: location_name,
      date: DateHelp.print(recordModel.get('date')),
      recorder: recordModel.get('recorder'),
      comment: occ.get('comment'),
      images: occ.images,
    };
  },
});

