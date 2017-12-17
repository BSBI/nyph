/** ****************************************************************************
 * Record Edit main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
// import Morel from 'morel';
import JST from 'JST';
import { DateHelp, StringHelp } from 'helpers';
import CONFIG from 'config';

import './styles.scss';

export default Marionette.View.extend({
  template: JST['records/details/main'],

  initialize() {
    // const recordModel = this.model.get('recordModel');
    // this.listenTo(recordModel, 'request sync error geolocation', this.render);
  },

  events: {
    'blur #nyph-list-title': 'nyphListTitleChange',
    'change #nyph-list-title': 'nyphListTitleChange',
    'blur #nyph-list-comments': 'commentsChange',
    'change #nyph-list-comments': 'commentsChange',
    'change #nyph-list-date': 'dateChange',
  },

  /**
   * fired after change or blur event on the title field
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  nyphListTitleChange(event) {
    const currentTitle = this.model.get('nyphListTitle');
    const newTitle = document.getElementById('nyph-list-title').value.trim();

    if (currentTitle !== newTitle) {
      this.model.set('nyphListTitle', newTitle);
      // this.model.markChangedAndResave();
      this.trigger('details:attribute:change', 'title');
    }
  },

  /**
   * fired after change or blur event on the comments field
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  commentsChange(event) {
    const currentComments = this.model.get('nyphListComments');
    const newComments = document.getElementById('nyph-list-comments').value.trim();

    if (currentComments !== newComments) {
      this.model.set('nyphListComments', newComments);
      // this.model.markChangedAndResave();
      this.trigger('details:attribute:change', 'comments');
    }
  },

  /**
   * fired after change event on the date field
   * ideally refresh code should be in the controller rather than here in the 'view'
   *
   * @param {Event} event
   */
  dateChange(event) {
    const currentDate = this.model.get('nyphListDate');
    const newDate = document.getElementById('nyph-list-date').value;

    if (currentDate !== newDate) {
      this.model.set('nyphListDate', newDate);
      // this.model.markChangedAndResave();
      this.trigger('details:attribute:change', 'date');
    }
  },

  serializeData() {
    const appModel = this.model;// .get('appModel');

    // regardless of CONFIG.ENFORCE_DATE_CONSTRAINT flag date range problems in UI

    const rawDate = appModel.get('nyphListDate');
    const modelDate = rawDate ? new Date(rawDate) : new Date();

    return {
      nyphListTitle: StringHelp.escape(appModel.get('nyphListTitle')),
      nyphListComments: StringHelp.escape(appModel.get('nyphListComments')),
      date: DateHelp.toDateInputValue(modelDate),
      maxDate: DateHelp.toDateInputValue(CONFIG.MAX_RECORDING_DATE),
      dateRangeError: (
        modelDate < CONFIG.MIN_RECORDING_DATE ||
        modelDate > CONFIG.MAX_RECORDING_DATE ||
        modelDate > (new Date())
      ),
    };
  },
});
