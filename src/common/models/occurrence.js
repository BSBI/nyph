import $ from 'jquery';
import Indicia from 'indicia';
import ImageModel from './image';
import CONFIG from 'config';

$.extend(true, Indicia.Occurrence.keys, CONFIG.indicia.occurrence);

export default Indicia.Occurrence.extend({
  Image: ImageModel,
});
