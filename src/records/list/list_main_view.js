/** ****************************************************************************
 * Record List main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Morel from 'morel';
import Hammer from 'hammerjs';
import { Log, StringHelp, Device, DateHelp } from 'helpers';
import JST from 'JST';
import Gallery from '../../common/gallery';
import './styles.scss';
import CONFIG from 'config';

const RecordView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell swipe',

  triggers: {
    'click .delete': 'record:delete',
  },

  events: {
    // need to pass the attribute therefore 'triggers' method does not suit
    'click .js-attr': 'clickShortcut',
    'click img': 'photoView',
  },

  modelEvents: {
    'request sync error': 'render',
    geolocation: 'render',
  },

  initialize() {
    this.template = JST[`records/list/record${(Device.isMobile() ? '_mobile' : '')}`];

    // fix zIndex bug if navigating back from maps view
    // as Marionette doesn't play well with chrome's back button
    document.getElementById('main').style.zIndex = 'auto';
  },

  photoView(e) {
    e.preventDefault();

    const items = [];

    this.model.occurrences.at(0).images.each((image) => {
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

  onRender() {
    Log('Records:List:MainView: rendering a record');

    // add mobile swipe events
    // early return
    if (!Device.isMobile()) {
      return;
    }

    this.$record = this.$el.find('a');
    this.docked = false;
    this.position = 0;

    const options = {
      threshold: 50,
      toolsWidth: 100,
    };

    Log(this.el);
    const hammertime = new Hammer(this.el, { direction: Hammer.DIRECTION_HORIZONTAL });
    const that = this;

    // on tap bring back
    this.$record.on('tap click', $.proxy(this._swipeHome, this));

    hammertime.on('pan', (e) => {
      e.preventDefault();
      that._swipe(e, options);
    });
    hammertime.on('panend', (e) => {
      that._swipeEnd(e, options);
    });
  },

  remove() {
    Log('Records:MainView: removing a record');
    // removing the last element leaves emptyView + fading out entry for a moment
    if (this.model.collection && this.model.collection.length >= 1) {
      const that = this;
      this.$el.addClass('shrink');
      setTimeout(() => {
        Marionette.View.prototype.remove.call(that);
      }, 300);
    } else {
      Marionette.View.prototype.remove.call(this);
    }
  },

  serializeData() {
    /** @var recordModel Occurrence */
    const recordModel = this.model;
    const occ = recordModel.occurrences.at(0);
    const date = DateHelp.prettyPrintStamp(recordModel);
    const taxonDescriptor = occ.get('taxon') || {};
    const images = occ.images;
    const img = images.length && images.at(0).get('thumbnail');

    // const taxon = species[species.found_in_name];

    const syncStatus = this.model.getSyncStatus();

    const locationPrint = recordModel.printLocation();
    const location = recordModel.get('location') || {};
    // const locationName = StringHelp.escape(recordModel.get('location_name'));

    // regardless of CONFIG.ENFORCE_DATE_CONSTRAINT, flag date range problems in UI
    const modelDate = new Date(recordModel.get('date'));

    const taxonMobileName = taxonDescriptor ?
      (
        taxonDescriptor.vernacularMatched ?
          StringHelp.escape(taxonDescriptor.vernacular)
          :
          StringHelp.escape(taxonDescriptor.qname)
      )
      :
      'missing taxon';

    return {
      id: recordModel.id || recordModel.cid,
      saved: recordModel.metadata.saved,
      onDatabase: syncStatus === Morel.SYNCED,
      isLocating: recordModel.isGPSRunning(),
      location: locationPrint,
      // location_name: locationName,
      location_gridref: location.gridref,
      // recorder: StringHelp.escape(recordModel.get('recorder') || ''),
      isSynchronising: syncStatus === Morel.SYNCHRONISING,
      date,
      taxon: taxonDescriptor,
      taxonMobileName,
      comment: occ.get('comment'),
      img: img ? `<img src="${img}"/>` : '',
      dateRangeError: (modelDate < CONFIG.MIN_RECORDING_DATE ||
      modelDate > CONFIG.MAX_RECORDING_DATE ||
      modelDate > (new Date())),
      idIncomplete: (!taxonDescriptor || taxonDescriptor.warehouse_id === CONFIG.UNKNOWN_SPECIES.warehouse_id) &&
        images.length === 0,
    };
  },

  _swipe(e, options) {
    // only swipe if no scroll up
    if (Math.abs(e.deltaY) > 10) return;

    if (this.docked) {
      this.position = -options.toolsWidth + e.deltaX;
    } else {
      this.position = e.deltaX;
    }

    // protection of swipeing right too much
    if (this.position > 0) this.position = 0;

    this.$record.css('transform', `translateX(${this.position}px)`);
  },

  _swipeEnd(e, options) {
    // only swipe if no scroll up and is not in the middle
    if (Math.abs(e.deltaY) > 10 && !this.position) return;

    if ((-options.toolsWidth + e.deltaX) > -options.toolsWidth) {
      // bring back
      this.position = 0;
      this.docked = false;
    } else {
      // open tools
      this.docked = true;
      this.position = -options.toolsWidth;
    }

    this.$record.css('transform', `translateX(${this.position}px)`);
  },

  _swipeHome(e) {
    if (this.docked) {
      e.preventDefault();
      this.position = 0;
      this.$record.css('transform', `translateX(${this.position}px)`);
      this.docked = false;
    }
  },

  clickShortcut(e) {
    e.preventDefault();
    this.trigger('record:edit:attr', this.model, $(e.target).data('attr'));
  },
});

const NoRecordsView = Marionette.View.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['records/list/list-none'],
});

export default Marionette.CompositeView.extend({
  id: 'records-list-container',
  template: JST['records/list/main'],

  childViewContainer: '#records-list',
  emptyView: NoRecordsView,
  childView: RecordView,

  events: {
    'blur #nyph-list-email': 'emailChange',
    'change #nyph-list-email': 'emailChange',
    'blur #nyph-list-recorders': 'recordersChange',
    'change #nyph-list-recorders': 'recordersChange',
    'blur #nyph-list-no-recorders': 'recorderNumberChange',
    'change #nyph-list-no-recorders': 'recorderNumberChange',
    'blur #nyph-list-place': 'placenameChange',
    'change #nyph-list-place': 'placenameChange',
  },

  // modelEvents: {
  //   'change': 'render';
  // }

  /**
   * fired after change or blur event on email field
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  emailChange(event) {
    // console.log('email address changed (parent)');
    // console.log(event);

    const currentEmail = this.options.appModel.get('nyphListEmail');
    // console.log(`current email: ${currentEmail}`);

    const emailEl = document.getElementById('nyph-list-email');

    if (emailEl.checkValidity()) {
      const newEmail = emailEl.value.trim();

      if (newEmail !== currentEmail) {
        // console.log(`email address changed to ${newEmail}`);
        this.options.appModel.set('nyphListEmail', newEmail);
        // this.options.appModel.save();

        this.trigger('list:attribute:change', 'email');
      }
    } else {
      console.log('Email address is not valid');
    }
  },

  /**
   * fired after change or blur event on place name field
   * (not the same as a gridref change)
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  placenameChange(event) {
    const currentPlacename = this.options.appModel.get('nyphListPlacename');
    const newPlacename = document.getElementById('nyph-list-place').value.trim();

    if (currentPlacename !== newPlacename) {
      this.options.appModel.set('nyphListPlacename', newPlacename);
      // this.options.appModel.markChangedAndResave();
      this.trigger('list:attribute:change', 'placename');
    }
  },

  /**
   * fired after change or blur event on recorders' field
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  recordersChange(event) {
    const currentRecorders = this.options.appModel.get('nyphListRecorders');
    const newRecorders = document.getElementById('nyph-list-recorders').value.trim();

    if (currentRecorders !== newRecorders) {
      this.options.appModel.set('nyphListRecorders', newRecorders);
      // this.options.appModel.save();
      this.trigger('list:attribute:change', 'recorders');
    }
  },

  /**
   * fired after change or blur event on number-of-people field
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  recorderNumberChange(event) {
    const currentRecorderNumber = this.options.appModel.get('nyphListNoRecorders');
    const newRecorders = document.getElementById('nyph-list-no-recorders').value.trim();

    if (currentRecorderNumber !== newRecorders) {
      this.options.appModel.set('nyphListNoRecorders', newRecorders);
      // this.options.appModel.save();
      this.trigger('list:attribute:change', 'norecorders');
    }
  },

  // invert the order
  attachHtml(collectionView, childView) {
    collectionView.$el.find(this.childViewContainer).prepend(childView.el);
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel,
    };
  },

  serializeData() {
    const appModel = this.options.appModel;

    return {
      // useTraining: appModel.get('useTraining'),
      nyphListEmail: StringHelp.escape(appModel.get('nyphListEmail')),
      nyphListRecorders: StringHelp.escape(appModel.get('nyphListRecorders')),
      nyphListNoRecorders: StringHelp.escape(appModel.get('nyphListNoRecorders')),
      nyphListPlacename: StringHelp.escape(appModel.get('nyphListPlacename')),
    };
  },
});
