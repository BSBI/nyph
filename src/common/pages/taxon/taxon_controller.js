/** ****************************************************************************
 * Taxon controller.
 *****************************************************************************/
import Backbone from 'backbone';
// import Morel from 'morel';
import App from 'app';
import { Log } from 'helpers';
import recordManager from '../../record_manager';
import appModel from '../../models/app_model';
import userModel from '../../models/user_model';
import Sample from '../../models/sample';
import Occurrence from '../../models/occurrence';
import MainView from './main_view';
import HeaderView from '../../views/header_view';
import BSBITaxonSearch from './search/bsbi_taxon_search';

const TaxonController = {
  show(recordID) {
    // SpeciesSearchEngine.init();
    this.taxonSearch = new BSBITaxonSearch();

    const that = this;
    this.id = recordID;

    if (recordID) {
      // check if the record has taxon specified
      recordManager.get(recordID, (getError, recordModel) => {
        if (getError) {
          App.regions.getRegion('dialog').error(getError);
          return;
        }

        // Not found
        if (!recordModel) {
          Log('No record model found', 'e');
          App.trigger('404:show', { replace: true });
          return;
        }

        let mainView;

        if (!recordModel.occurrences.at(0).get('taxon')) {
          mainView = new MainView({ model: userModel });
        } else {
          mainView = new MainView({ removeEditBtn: true, model: userModel });
        }
        TaxonController._showMainView(mainView, that);
      });
    } else {
      const mainView = new MainView({ model: userModel });
      TaxonController._showMainView(mainView, this);

      // should be done in the view
      App.regions.getRegion('main').$el.find('#taxon').select();
    }

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Species',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
  },

  _showMainView(mainView, that) {
    const sampleID = that.id;
    const taxonSearch = that.taxonSearch;

    mainView.on('taxon:selected', (taxon, edit) => {
      TaxonController.updateTaxon(sampleID, taxon, (err, sample) => {
        if (err) {
          Log(err, 'e');
          App.regions.getRegion('dialog').error(err);
          return;
        }

        if (edit) {
          const updatedSampleID = sample.id || sample.cid;
          App.trigger('records:edit', updatedSampleID, { replace: true });
          // } else if (sample.get('location_name')) {
        } else {
          const gpsEnabled = appModel.gpsEnabled();
          const lockedLocation = appModel.getAttrLock('location');

          if (gpsEnabled || (lockedLocation && lockedLocation.gridref)) {
            // navigate back to list if using gps or have locked gridref

            // interfere with app flow
            // if location not set then navigate to that screen
            // otherwise go back to list

            // already have a satisfactory locked location
            // return to previous page
            window.history.back();
          } else {
            // navigate to edit the location of the new record
            App.trigger('records:edit:location', sample.cid, { replace: true });
          }
        }
      });
    }, that);

    mainView.on('taxon:searched', (searchPhrase) => {
      // SpeciesSearchEngine.search(searchPhrase, (selection) => {
      //   mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
      // });

      // const taxonSearch = new BSBITaxonSearch();

      mainView.updateSuggestions(
        new Backbone.Collection(taxonSearch.lookup(searchPhrase)),
        searchPhrase);
    }, that);

    App.regions.getRegion('main').show(mainView);
  },

  updateTaxon(sampleID, taxon, callback) {
    if (!sampleID) {
      // create new sighting
      const occurrence = new Occurrence({
        taxon,
      });

      const sample = new Sample();
      sample.addOccurrence(occurrence);
      sample.set_entry_time();

      // add locked attributes
      appModel.appendAttrLocks(sample);

      recordManager.set(sample, (saveError) => {
        if (saveError) {
          callback(saveError);
          return;
        }

        // check if location attr is not locked
        const locks = appModel.get('attrLocks');

        if (appModel.gpsEnabled()) {
          if (!locks.location) {
            // no previous location
            sample.startGPS();
          } else if (!locks.location.latitude) {
            // previously locked location was through GPS
            // so try again
            sample.startGPS();
          }
        }

        callback(null, sample);
      });
    } else {
      // edit existing one
      recordManager.get(sampleID, (getError, recordModel) => {
        if (getError) {
          callback(getError);
          return;
        }

        recordModel.occurrences.at(0).set('taxon', taxon);
        recordModel.markChangedAndResave(null, {
          success: (sample) => {
            callback(null, sample);
          },
          error: (saveError) => {
            callback(saveError);
          },
        });
      });
    }
  },
};

export { TaxonController as default };
