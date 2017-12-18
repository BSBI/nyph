/** ****************************************************************************
 * Generates species list suggestions.
 *****************************************************************************/
// import Backbone from 'backbone';
// import _ from 'lodash';
// import { Log } from 'helpers';
// import searchCommonNames from './commonNamesSearch';
// import searchSciNames from './scientificNamesSearch';
// import helpers from './searchHelpers';
// import CONFIG from 'config';
import TaxonNames from './bsbi_taxon_names';

// let species;
// let loading = false;
// let commonNamePointers;

// const MAX = 20;

// const API = {
//   init(callback) {
//     // Log('Taxon search engine: initializing');
//     // const that = this;
//     //
//     // loading = true;
//     // require.ensure([], () => {
//     //   loading = false;
//     //   species = require('species.data');
//     //   commonNamePointers = require('species_names.data');
//     //   that.trigger('data:loaded');
//     //   callback && callback();
//     // }, 'data');
//   },

  /**
   * Returns an array of taxa in format
   {
     array_id: "Genus array index"
     species_id: "Species array index"
     species_name_id: "Species name index" //to know where found
     warehouse_id: "Warehouse id"
     group: "Species group"
     scientific_name: "Scientific name"
     common_name: "Common name"
     synonym: "Common name synonym"
   }
   */
  // search(searchPhrase, callback, maxResults = MAX, scientificOnly) {
  //   let results = [];
  //
  //   if (!searchPhrase) {
  //     results.push(Object.assign({}, CONFIG.UNKNOWN_SPECIES));
  //     callback(results);
  //     return;
  //   }
  //
  //   // normalize the search phrase
  //   const normSearchPhrase = searchPhrase.toLowerCase();
  //
  //   // check if scientific search
  //   const isScientific = helpers.isPhraseScientific(normSearchPhrase);
  //   if (isScientific || scientificOnly) {
  //     // search sci names
  //     searchSciNames(species, normSearchPhrase, results, maxResults);
  //   } else {
  //     // search common names
  //     results = searchCommonNames(species, commonNamePointers, normSearchPhrase);
  //
  //     // if not enough
  //     if (results.length <= MAX) {
  //       // search sci names
  //       searchSciNames(species, normSearchPhrase, results);
  //     }
  //   }
  //
  //   // return results in the order
  //   callback(results);
  // },
// };

/**
 *
 * @constructor
 */
const BSBITaxonSearch = function () {};

/**
 * see TaxonRank::sort
 *
 * @type int|null
 */
BSBITaxonSearch.prototype.minimumRankSort = null;

/**
 * if set then only taxa with records are returned
 *
 * @type boolean
 */
BSBITaxonSearch.prototype.requireExtantDDbRecords = true;

/**
 * if set then only taxa with records present in the specified status scheme (scheme id code)
 * (default null)
 *
 * @type string|null
 */
BSBITaxonSearch.prototype.requiredStatusSchemeId = null;

/**
 * if set then require that returned taxon names are >= 3 letters
 * and don't contain numerals
 *
 * @type boolean
 */
BSBITaxonSearch.prototype.skipJunk = true;

/**
 * (static config setting)
 *
 * @type {boolean}
 */
BSBITaxonSearch.showVernacular = true;

// /**
//  * static configuration
//  *
//  */
// BSBITaxonSearch.allow_vernacular_searches = function () {
//   BSBITaxonSearch.showVernacular = true;
// };

// BSBITaxonSearch.prototype.refresh_query_options = function () {
//   const params = {};
//
//   if (BSBITaxonSearch.showVernacular) {
//     params.allowVernacular = '1';
//   }
//
//   if (this.minimumRankSort !== null) {
//     params.minSort = this.minimumRankSort;
//   }
//
//   if (this.requireExtantDDbRecords) {
//     params.requireDDbRecords = true;
//   }
//
//   if (this.skipJunk) {
//     params.noJunk = true;
//   }
//
//   if (this.requiredStatusSchemeId !== null) {
//     params.statusschemeid = this.requiredStatusSchemeId;
//   }
// };

/**
 *
 * @param {object} taxonResult
 * @param {string} queryString
 * @returns {string}
 */
BSBITaxonSearch.prototype.formatter = function (taxonResult, queryString = '') {
  if (BSBITaxonSearch.showVernacular) {
    if (taxonResult.vernacularMatched) {
      if (taxonResult.acceptedEntityId) {
        return `<q><b>${taxonResult.vernacular}</b></q> <span class="italictaxon">${taxonResult.uname}${taxonResult.qualifier ? ` <b>${taxonResult.qualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.authority}</span>` +
          ` = <span class="italictaxon">${taxonResult.acceptedNameString}${taxonResult.acceptedQualifier ? ` <b>${taxonResult.acceptedQualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.acceptedAuthority}</span>`;
      }
      return `<q><b>${taxonResult.vernacular}</b></q> <span class="italictaxon">${taxonResult.uname}${taxonResult.qualifier ? ` <b>${taxonResult.qualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.authority}</span>`;
    }
    if (taxonResult.acceptedEntityId) {
      return `<span class="italictaxon">${taxonResult.uname}${taxonResult.qualifier ? ` <b>${taxonResult.qualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.authority}</span>${taxonResult.vernacular ? ` <q><b>${taxonResult.vernacular}</b></q>` : ''
          } = <span class="italictaxon">${taxonResult.acceptedNameString}${taxonResult.acceptedQualifier ? ` <b>${taxonResult.acceptedQualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.acceptedAuthority}</span>`;
    }
    return `<span class="italictaxon">${taxonResult.uname}${taxonResult.qualifier ? ` <b>${taxonResult.qualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.authority}</span>${taxonResult.vernacular ? ` <q><b>${taxonResult.vernacular}</b></q>` : ''}`;
  }
  if (taxonResult.acceptedEntityId) {
    return `<span class="italictaxon">${taxonResult.uname}${taxonResult.qualifier ? ` <b>${taxonResult.qualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.authority}</span>` +
        ` = <span class="italictaxon">${taxonResult.acceptedNameString}${taxonResult.acceptedQualifier ? ` <b>${taxonResult.acceptedQualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.acceptedAuthority}</span>`;
  }
  return `<span class="italictaxon">${taxonResult.uname}${taxonResult.qualifier ? ` <b>${taxonResult.qualifier}</b>` : ''}</span> <span class="taxauthority">${taxonResult.authority}</span>`;
};

// BSBITaxonSearch.prototype.dataSourceResponseSchema = {
//   resultsList: 'Response.Results',
//   fields: [
//     { key: 'name' }, // qualified name
//     { key: 'uname' },
//     { key: 'id' },
//     { key: 'entityId' },
//     { key: 'qualifier' },
//     { key: 'authority' },
//     { key: 'vernacular' },
//     { key: 'vernacularMatched' }, // if set then match was against vernacular name rather than latin name
//     { key: 'acceptedNameString' },
//     { key: 'acceptedEntityId' },
//     { key: 'acceptedQualifier' },
//     { key: 'acceptedAuthority' },
//   ],
// };

BSBITaxonSearch.abbreviatedGenusRegex = /^(X\s+)?([a-z])[\.\s]+(.*?)$/i;

BSBITaxonSearch.nameStringColumn = 0;
BSBITaxonSearch.canonicalColumn = 1;
BSBITaxonSearch.hybridCanonicalColumn = 2;
BSBITaxonSearch.acceptedEntityIdColumn = 3;
BSBITaxonSearch.qualifierColumn = 4;
BSBITaxonSearch.authorityColumn = 5;
BSBITaxonSearch.vernacularColumn = 6;
BSBITaxonSearch.vernacularRootColumn = 7;
BSBITaxonSearch.usedColumn = 8;
BSBITaxonSearch.minRankColumn = 9;

// BSBITaxonSearch.prototype.build = function (inputId, containerId) {
//   this.dataSource = new YAHOO.util.FunctionDataSource(BSBITaxonSearch.prototype.lookup);
//   this.dataSource.scope = this;
//   this.dataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
//
//   this.dataSource.connXhrMode = 'cancelStaleRequests';
//   this.dataSource.useXPath = true;
//   this.dataSource.responseSchema = this.dataSourceResponseSchema;
//
//   const el = document.getElementById(inputId);
//
//   // stop mobile browsers doing nasty things to taxon names
//   el.spellcheck = false;
//   el.autocomplete = 'off';
//   el.autocorrect = 'off';
//   el.autocapitalize = 'off';
//
//   this.dropBox = new YAHOO.widget.AutoComplete(inputId, containerId, this.dataSource, shallow_clone(this.autoCompleteConfig));
//
//   this.dropBox.resultTypeList = false;
//
//   this.dropBox.generateRequest = function (queryString) {
//     return queryString;
//   };
//
//   this.dropBox.formatResult = this.formatter;
//
//   // if dropbox should open on focus
//   if (this.autoCompleteConfig.openOnFocus) {
//     this.dropBox.textboxFocusEvent.subscribe(this.focus_handler, this, true);
//   }
// };

const taxonRankNameSearchRegex = [
  /\s+sub\-?g(?:en(?:us)?)?[\.\s]+/i,
  /\s+sect(?:ion)?[\.\s]+/i,
  /\s+subsect(?:ion)?[\.\s]+/i,
  /\s+ser(?:ies)?[\.\s]+/i,
  /\s+gp[\.\s]+/i,
  /\s+s(?:ub)?\-?sp(?:ecies)?[\.\s]+/i,
  /\s+morphotype\s+/i,
  /\s+var[\.\s]+/i,
  /\s+cv[\.\s]+/i,
  /\s+n(?:otho)?v(?:ar)?[\.\s]+/i,
  /\s+f[\.\s]+|\s+forma?\s+/i,
  /\s+n(?:otho)?ssp[\.\s]+/i,
];

const taxonRankNameReplacement = [
  ' subg. ',
  ' sect. ',
  ' subsect. ',
  ' ser. ',
  ' group ',
  ' subsp. ',
  ' morph. ',
  ' var. ',
  ' cv. ', // ddb preference is for single quotes for cultivars
  ' nothovar. ',
  ' f. ',
  ' nothosubsp. ',
];

/**
 * well-formed ranks, used for stripping rank from name for results table sorting
 *
 * @type RegExp
 */
const cleanRankNamesRegex = /\s(subfam\.|subg\.|sect\.|subsect\.|ser\.|subser\.|subsp\.|nothosubsp\.|microsp\.|praesp\.|agsp\.|race|convar\.|nm\.|microgene|f\.|subvar\.|var\.|nothovar\.|cv\.|sublusus|taxon|morph\.|group|sp\.)\s/;

/**
 *
 * @type Array *DON'T COPY THESE YET, AS THEY ARE AN UNOPTIMIZED MESS!*
 */
const taxonQualifierSearchRegex = [
  /\s*\(?\bf\s*x\s*m or m\s*x\s*f\)?\s*$/i,
  /\s*\(?\bm\s*x\s*f or f\s*x\s*m\)?\s*$/i,

  // '/\b\s*\(?f\s*x\s*m\)?\s*$/i',
  // '/\b\s*\(?m\s*x\s*f\)?\s*$/i',
  /\s*\(?\bf\s*x\s*m\)?\s*$/i,
  /\s*\(?\bm\s*x\s*f\)?\s*$/i,

  // '/\b\s*\(?female\s*x\s*male\)?\s*$/i',
  // '/\b\s*\(?male\s*x\s*female\)?\s*$/i',
  /\s*\(?\bfemale\s*x\s*male\)?\s*$/i,
  /\s*\(?\bmale\s*x\s*female\)?\s*$/i,

  // stand-alone male/female qualifier (e.g. applied to Petasites hybridus)
  // removes single quotes
  /\s*\'male\'\s*$/i,
  /\s*\'female\'\s*$/i,

  // mid-string ss/sl qualifiers
  /\b\s*sens\.?\s*lat[\.\s]+/i,
  /\b\s*s\.\s*lat\.?\s*\b/i,
  /\b\s*s\.?\s*l\.?\s+\b/i,
  /\b\s*sensu\s*lato\s+\b|\(\s*sensu\s*lato\s*\)/i,

  /\b\s*sensu\s*stricto\s+\b|\(\s*sensu\s*stricto\s*\)/i,
  /\b\s*sens\.?\s*strict[\.\s]+/i,

  // '/\b\s*sens\.?\s*str\.?\s*(?=\))|\b\s*sens\.?\s*str\.?\s*\b/i', // the first look-ahead option matches before a closing-paren (\b fails between '.)' )
  /\b\s*sens\.?\s*str\.?\s*(?=\))|\b\s*sens\.?\s*str[\.\s]+/i,
  // '/\b\s*s\.\s*str\.?\s*\b/i',
  /\b\s*s\.\s*str[\.\s]+/i,
  /\b\s*s\.?\s*s\.?\s+\b/i,

  // end-of-string ss/sl qualifiers
  /\b\s*sens\.?\s*lat\.?\s*$/i,
  /\b\s*s\.\s*lat\.?\s*$/i,
  /\b\s*s\.?\s*l\.?\s*$/i,
  /\b\s*sensu\s*lato\s*$/i,

  /\b\s*sensu\s*stricto\s*$/i,
  /\b\s*sens\.?\s*strict\.?\s*$/i,
  /\b\s*sens\.?\s*str\.?\s*$/i,
  /\b\s*s\.\s*str\.?\s*$/i,
  /\b\s*s\.?\s*s\.?\s*$/i,

  /\b\s*agg\.?\s*$/i,
  /\b\s*aggregate\s*$/i,

  /\b\s*sp\.?\s*cultivar\s*$/i,
  /\b\s*sp\.?\s*cv\.?\s*$/i,
  /\b\s*cultivars?\s*$/i,
  /\b\s*cv\s+$/i,
  /\b\s*cv$/i,

  /\b\s*cf\s*$/i,
  /\b\s*aff\s*$/i,
  /\b\s*s\.?n\.?\s*$/i,
  /\b\s*sp\.?\s*nov\.?\s*$/i,

  /\b\s*auct[\.\s]*$/i,

  /\b\s*ined[\.\s]*$/i,

  /\b\s*nom\.?\snud[\.\s]*$/i,

  /\b\s*p\.p[\.\s\?]*$/i,

  /\b\s*spp?\.?[\s\?]*$/i,
  /\b\s*species\s*$/i,
  /\b\s*spp?\.?\s*\(/i, // catch e.g. Ulmus sp. (excluding Ulmus glabra)
  /\b\s*species\s*\(/i,
];

const taxonQualifierReplacement = [
  ' ', // (f x m or m x f) is the default so an explicit qualifier isn't used
  ' ', // (m x f or f x m) is the default so an explicit qualifier isn't used

  ' (f x m)',
  ' (m x f)',

  ' (f x m)',
  ' (m x f)',

  // stand-alone male/female qualifier (e.g. applied to Petasites hybridus)
  // removed single quotes
  ' male',
  ' female',

  // mid-string ss/sl qualifiers
  ' s.l. ',
  ' s.l. ',
  ' s.l. ',
  ' s.l. ',

  ' s.s. ',
  ' s.s. ',
  ' s.s. ',
  ' s.s. ',
  ' s.s. ',

  // end-of-string ss/sl qualifiers
  ' s.l.',
  ' s.l.',
  ' s.l.',
  ' s.l.',

  ' s.s.',
  ' s.s.',
  ' s.s.',
  ' s.s.',
  ' s.s.',

  ' agg.',
  ' agg.',

  ' cv. ',
  ' cv. ',
  ' cv. ',
  ' cv. ',
  ' cv. ',

  ' cf.',
  ' aff.',

  ' sp.nov.',
  ' sp.nov.',

  ' auct.',

  ' ined.',

  ' nom. nud.',

  ' pro parte',

  '',
  '',
  ' (',
  ' (',
];

BSBITaxonSearch.prototype.normalise_taxon_name = function (taxonString) {
  for (let i = 0, l = taxonRankNameSearchRegex.length; i < l; i++) {
    taxonString = taxonString.replace(taxonRankNameSearchRegex[i], taxonRankNameReplacement[i]);
  }

  for (let i = 0, l = taxonQualifierSearchRegex.length; i < l; i++) {
    taxonString = taxonString.replace(taxonQualifierSearchRegex[i], taxonQualifierReplacement[i]);
  }

  return taxonString;
};


/**
 * from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
 *
 * @param {string} literal
 * @return string
 */
const escapeRegExp = function (literal) {
  return literal.replace(escapeRegExp.cleanRegex, '\\$&');
};

escapeRegExp.cleanRegex = /[.*+?^${}()|[\]\\]/g;

/**
 * generate hybrid name permutations
 *
 * @param {string} names unescaped series of species e.g. "glandulifera" or "carex x nigra"
 * @returns {string} name permutations formatted as a regular expression
 */
BSBITaxonSearch.prototype.generate_hybrid_combinations_regex = function (names) {
  const splitParts = escapeRegExp(names).split(/\s+x\s+/i);
  if (splitParts.length < 2) {
    return splitParts[0];
  }

  const hybridPermutations = [];
    /**
     * generate hybrid name permutations
     *
     * modified from O'Reilly PHP Cookbook
     * http://docstore.mik.ua/orelly/webprog/pcook/ch04_26.htm
     *
     * @param {Array<string>} items
     * @param {Array<string>} perms
     */
  const permutate = function (items, perms) {
    if (items.length === 0) {
      hybridPermutations[hybridPermutations.length] = perms.join('[a-zA-Z]* x ');
    } else {
      for (let i = items.length - 1; i >= 0; --i) {
        const newItems = items.slice(0);
        const newPerms = perms.slice(0); // take copies of the array

        newPerms.unshift(newItems.splice(i, 1)[0]);
        permutate(newItems, newPerms);
      }
    }
  };

  permutate(splitParts, []);

  return `(?:${hybridPermutations.join('|')})`;
};

/**
 *
 * @param {string} query
 * @returns {{Response: {Results: *}}}
 */
BSBITaxonSearch.prototype.lookup = function (query) {
  // var timeStart = Date.now(); //track search time
  let results,
    testTaxon,
    taxonString = this.normalise_taxon_name(decodeURIComponent(query).trim()),
    canonical,
    matchedIds = {},
    id,
    preferHybrids = / x\b/.test(taxonString);

  // ignore trailing ' x' from string which would just muck up result matching
  taxonString = taxonString.replace(/\s+x$/i, '');

  if (taxonString !== '') {
    // BSBITaxonSearch.abbreviatedGenusRegex = /^(X\s+)?([a-z])[\.\s]+(.*?)$/i;
    const abbreviatedMatches = taxonString.match(BSBITaxonSearch.abbreviatedGenusRegex);
    if (abbreviatedMatches) {
      // matched an abbreviated genus name (or an abbreviated hybrid genus)

      let exp,
        nearMatchExp;
      if (abbreviatedMatches[2] === 'X' || abbreviatedMatches[2] === 'x') {
        // either have a genus name beginning 'X' or a hybrid genus

        exp = new RegExp(`^(X\\s|X[a-z]+\\s+)(x )?\\b${this.generate_hybrid_combinations_regex(abbreviatedMatches[3])}.*`, 'i');
        nearMatchExp = exp;
      } else {
        exp = new RegExp(`^(X )?${escapeRegExp(abbreviatedMatches[2])}[a-z]+ (x )?.*\\b${this.generate_hybrid_combinations_regex(abbreviatedMatches[3])}.*`, 'i');

        /**
         * Similar to exp but without flexibility (.*) after genus part
         * used only for result ranking (exact>near>vague)
         */
        nearMatchExp = new RegExp(`^(X )?${escapeRegExp(abbreviatedMatches[2])}[a-z]+ (x )?\\b${this.generate_hybrid_combinations_regex(abbreviatedMatches[3])}.*`, 'i');
      }

      for (id in TaxonNames) {
        testTaxon = TaxonNames[id];

        /**
         * The canonical name may be identical to the nameString in which case JSON taxon list stores
         * zero instead to save file space (and to mark that canonical name should be ignored)
         */
        canonical = testTaxon[BSBITaxonSearch.canonicalColumn] === 0 ?
          testTaxon[BSBITaxonSearch.nameStringColumn]
          :
          testTaxon[BSBITaxonSearch.canonicalColumn];

        if (exp.test(canonical) ||
          ((testTaxon[BSBITaxonSearch.hybridCanonicalColumn] !== '') && exp.test(testTaxon[BSBITaxonSearch.hybridCanonicalColumn]))
        ) {
          matchedIds[id] = {
            exact: (testTaxon[BSBITaxonSearch.nameStringColumn] === taxonString),
            near: (nearMatchExp.test(testTaxon[BSBITaxonSearch.nameStringColumn])),
          };
        }
      }

      results = this.compile_results(matchedIds, preferHybrids);
    } else {
      // genus is not abbreviated

      let canonicalQuery,
        nearMatchRegex;
      const escapedTaxonString = escapeRegExp(taxonString);

      if (taxonString.indexOf(' ') !== -1) {
        // hybrids of the form Species x nothoname or Species nothoname should be seen as equivalent

        canonicalQuery = `${escapeRegExp(taxonString.substr(0, taxonString.indexOf(' ')))
          } (x )?.*\\b${this.generate_hybrid_combinations_regex(taxonString.substr(taxonString.indexOf(' ') + 1))}.*`;

        /**
         * Similar to canonicalQuery/hybridCanonicalQuery but without flexibility (.*) after genus part
         * used only for result ranking (exact>near>vague)
         */
        nearMatchRegex = new RegExp(`^(?:X\s+)?${escapeRegExp(taxonString.substr(0, taxonString.indexOf(' ')))
          } (x )?\\b${this.generate_hybrid_combinations_regex(taxonString.substr(taxonString.indexOf(' ') + 1))}.*`, 'i');
      } else {
        canonicalQuery = `${escapedTaxonString}.*`;
        nearMatchRegex = new RegExp(`^${escapedTaxonString}.*`);
      }

      const strictEscapedTaxonString = `^${escapedTaxonString}.*`;
      // var escapedTaxonStringRegExp = new RegExp(strictEscapedTaxonString, 'i');
      // var canonicalQueryRegExp = new RegExp('^' + canonicalQuery, 'i');
      // var hybridCanonicalQueryregExp = new RegExp('^X ' + canonicalQuery, 'i');
      const canonicalQueryRegExp = new RegExp(`^(?:X\s+)?${canonicalQuery}`, 'i');

      if (!BSBITaxonSearch.showVernacular) {
        // no vernacular

        for (id in TaxonNames) {
          testTaxon = TaxonNames[id];

          canonical = testTaxon[BSBITaxonSearch.canonicalColumn] === 0 ?
            testTaxon[BSBITaxonSearch.nameStringColumn]
            :
            testTaxon[BSBITaxonSearch.canonicalColumn];

          if (
            // testTaxon[BSBITaxonSearch.nameStringColumn].search(escapedTaxonStringRegExp) !== -1 ||
          canonicalQueryRegExp.test(testTaxon[BSBITaxonSearch.nameStringColumn]) ||
          ((canonical !== testTaxon[BSBITaxonSearch.nameStringColumn]) && canonicalQueryRegExp.test(canonical))
          // testTaxon[BSBITaxonSearch.nameStringColumn].search(hybridCanonicalQueryregExp) !== -1
          ) {
            matchedIds[id] =
              { exact: (testTaxon[BSBITaxonSearch.nameStringColumn] == taxonString) };
          }
        }

        results = this.compile_results(matchedIds, preferHybrids);
      } else {
        const caseInsensitiveEscapedTaxonRegex = new RegExp(strictEscapedTaxonString, 'i');

        for (id in TaxonNames) {
          testTaxon = TaxonNames[id];

          canonical = testTaxon[BSBITaxonSearch.canonicalColumn] === 0 ?
            testTaxon[BSBITaxonSearch.nameStringColumn]
            :
            testTaxon[BSBITaxonSearch.canonicalColumn];

          if (
            // testTaxon[BSBITaxonSearch.nameStringColumn].search(escapedTaxonStringRegExp) !== -1 ||
          canonicalQueryRegExp.test(testTaxon[BSBITaxonSearch.nameStringColumn]) ||
          ((canonical !== testTaxon[BSBITaxonSearch.nameStringColumn]) && canonicalQueryRegExp.test(canonical))
          // testTaxon[BSBITaxonSearch.nameStringColumn].search(hybridCanonicalQueryregExp) !== -1
          ) {
            matchedIds[id] = {
              exact: (testTaxon[BSBITaxonSearch.nameStringColumn] == taxonString),
              near: (nearMatchRegex.test(testTaxon[BSBITaxonSearch.nameStringColumn]) ||
                nearMatchRegex.test(canonical)),
            };
          } else if (
            caseInsensitiveEscapedTaxonRegex.test(testTaxon[BSBITaxonSearch.vernacularColumn]) ||
            caseInsensitiveEscapedTaxonRegex.test(testTaxon[BSBITaxonSearch.vernacularRootColumn])
          ) {
            matchedIds[id] = {
              exact: (testTaxon[BSBITaxonSearch.nameStringColumn] == taxonString),
              vernacular: true,
            };
          }
        }

        results = this.compile_results(matchedIds, preferHybrids);

        /**
         * if very few matches then retry searching using much fuzzier matching
         */
        if (results.length < 5) {
          const broadRegExp = new RegExp(`\\b${escapedTaxonString}.*`, 'i'); // match anywhere in string

          for (id in TaxonNames) {
            if (!matchedIds.hasOwnProperty(id)) {
              testTaxon = TaxonNames[id];

              if (broadRegExp.test(testTaxon[BSBITaxonSearch.nameStringColumn])) {
                matchedIds[id] =
                  { exact: (testTaxon[BSBITaxonSearch.nameStringColumn] == taxonString) };
              } else if (
                (testTaxon[BSBITaxonSearch.canonicalColumn] !== 0 && broadRegExp.test(testTaxon[BSBITaxonSearch.canonicalColumn])) ||
                broadRegExp.test(testTaxon[BSBITaxonSearch.vernacularColumn])
              ) {
                matchedIds[id] =
                { exact: (testTaxon[BSBITaxonSearch.nameStringColumn] == taxonString),
                  vernacular: true };
              }
            }
          }

          results = this.compile_results(matchedIds, preferHybrids);
        }
      }
    }
  } else {
    results = [];
  }

  return results;
};

BSBITaxonSearch.prototype.compile_results = function (matchedIds, preferHybrids) {
  const results = [];

  for (const id in matchedIds) {
    if (matchedIds.hasOwnProperty(id)) {
      const taxon = TaxonNames[id];

      if (
        (!this.requireExtantDDbRecords || (this.requireExtantDDbRecords && taxon[BSBITaxonSearch.usedColumn] === 1)) &&
        (!this.minimumRankSort || (this.minimumRankSort > 0 && taxon[BSBITaxonSearch.minRankColumn] >= this.minimumRankSort))
      ) {
        const qname = taxon[BSBITaxonSearch.nameStringColumn] + (taxon[BSBITaxonSearch.qualifierColumn] ? (` ${taxon[BSBITaxonSearch.qualifierColumn]}`) : '');

        const row = {
          entityId: id,
          vernacular: taxon[BSBITaxonSearch.vernacularColumn],
          qname,
          name: qname, // use qualified name for the generic name field
          qualifier: taxon[BSBITaxonSearch.qualifierColumn],
          authority: taxon[BSBITaxonSearch.authorityColumn],
          uname: taxon[BSBITaxonSearch.nameStringColumn],
          vernacularMatched: matchedIds[id].hasOwnProperty('vernacular'),
          exact: matchedIds[id].hasOwnProperty('exact') && matchedIds[id].exact,
          near: matchedIds[id].hasOwnProperty('near') && matchedIds[id].near,
        };

        row.formatted = this.formatter(row);

        if (taxon[BSBITaxonSearch.acceptedEntityIdColumn]) {
          const acceptedTaxon = TaxonNames[taxon[BSBITaxonSearch.acceptedEntityIdColumn]];

          if (!acceptedTaxon) {
            if (!TaxonNames) {
              throw new Error(`TaxonNames set is undefined, when trying to find taxon for accepted entity id ${taxon[BSBITaxonSearch.acceptedEntityIdColumn]}`);
            } else {
              throw new Error(`Failed to find taxon for accepted entity id ${taxon[BSBITaxonSearch.acceptedEntityIdColumn]}`);
            }
          }

          row.acceptedEntityId = taxon[BSBITaxonSearch.acceptedEntityIdColumn];
          row.acceptedNameString = acceptedTaxon[BSBITaxonSearch.nameStringColumn];
          row.acceptedQualifier = acceptedTaxon[BSBITaxonSearch.qualifierColumn];
          row.acceptedAuthority = acceptedTaxon[BSBITaxonSearch.authorityColumn];
        }

        results.push(row);
      }
    }
  }

  if (results.length) {
    results.sort((a, b) => {
      if (a.exact) {
        // logger('exact test a: ' + a.uname + ' vs ' + b.uname);
        // logger(b);
        if (b.exact) {
          return a.acceptedEntityId ? 1 : 0; // prefer accepted name
        }
        return -1;

        // return b.exact ? 0 : -1;
      } else if (b.exact) {
        // logger('exact test b: ' + b.uname);
        return 1;
      }

      if (a.near) {
        if (!b.near) {
          return -1;
        }
      } else if (b.near) {
        // logger('exact test b: ' + b.uname);
        return 1;
      }

      const aIsHybrid = a.uname.match(/\bx\b/i) !== null;
      const bIsHybrid = b.uname.match(/\bx\b/i) !== null;

      if (aIsHybrid) {
        // logger('hybrid test: ' + a.qname + ' vs ' + b.qname);
        // logger('hybrid test: ' + a.uname + ' vs ' + b.uname);
        if (bIsHybrid) {
          if (a.uname === b.uname) {
            return a.acceptedEntityId ? 1 : 0; // prefer accepted name
          }
          return a.qname < b.qname ? -1 : 1;
        }
        return preferHybrids ? -1 : 1;
      } else if (bIsHybrid) {
        return preferHybrids ? 1 : -1;
      } else if (a.uname === b.uname) {
        if (a.acceptedEntityId !== b.acceptedEntityId) {
            // a or b and not an accepted name
          return a.acceptedEntityId ? 1 : 0; // prefer accepted name
        }
        return (b.qualifier == '' || a.qualifier < b.qualifier) ? 1 : -1; // reverse sort qualifier so that ss or empty come before s.l.
      }
      return a.qname < b.qname ? -1 : 1;
    });
  }

  return results;
};

// _.extend(API, Backbone.Events);

export { BSBITaxonSearch as default };
