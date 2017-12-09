/** ****************************************************************************
 * List details header view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Morel from 'morel';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'nav',
  template: JST['records/details/header'],

  events: {
    'click a[data-rel="back"]': 'navigateBack',
  },

  modelEvents: {
    'request sync error': 'render',
  },

  navigateBack() {
    window.history.back();
  },

  serializeData() {
    return {
      // isSynchronising: this.model.getSyncStatus() === Morel.SYNCHRONISING,
    };
  },
});

