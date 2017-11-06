var Events = require('./events');
var Engine = require('../../engine');
var Layers = require('./layers');
var Leaflet = require('./leaflet');
var VERSION = require('../../../package.json').version;

/**
 * This is the main object in a Carto.js application.
 *
 * The carto client keeps both layer and dataview lists internaly. Every time some layer/dataview changes
 * the client will trigger a carto-reload cycle.
 *
 * @param {object} settings
 * @param {string} settings.apiKey - Api key used to be autenticate in the windshaft server.
 * @param {string} settings.username - Name of the user registered in the windshaft server.
 * @param {string} settings.serverUrl - Url of the windshaft server.
 *
 * @constructor
 * @memberof carto
 * @api
 *
 * @fires carto.events.SUCCESS
 * @fires carto.events.ERROR
 */
function Client (settings) {
  this._layers = new Layers();
  this._dataviews = [];
  this._engine = new Engine({
    apiKey: settings.apiKey,
    username: settings.username,
    serverUrl: settings.serverUrl,
    statTag: 'carto.js-v' + VERSION
  });
}

/**
 * Bind a callback function to an event. The callback will be invoked whenever the event is fired.
 *
 * @param {string} event - The name of the event that triggers the callback execution.
 * @param {function} callback - A function to be executed when the event is fired.
 *
 * @example
 *
 * // Define a callback to be executed once the map is reloaded.
 * function onReload(event) {
 *  console.log(event); // "reload-success"
 * }
 *
 * // Attach the callback to the RELOAD_SUCCESS event.
 * client.on(carto.events.SUCCESS, onReload);
 * @api
 */
Client.prototype.on = function (event, callback) {
  switch (event) {
    case Events.SUCCESS:
      this._engine.on(Engine.Events.RELOAD_SUCCESS, callback);
      return this;
    case Events.ERROR:
      this._engine.on(Engine.Events.RELOAD_ERROR, callback);
      return this;
    default:
      throw new Error('Unrecognized event: ' + event);
  }
};

/**
 * Add a layer to the client.
 *
 * @param {carto.layer.Base} - The layer to be added
 * @param {object} opts
 * @param {boolean} opts.reload - Default: true. A boolean flag controlling if the client should be reloaded
 *
 * @returns {Promise} - A promise that will be fulfilled when the reload cycle is completed.
 * @api
 */
Client.prototype.addLayer = function (layer, opts) {
  return this.addLayers([layer], opts);
};

/**
 * Add a layer array to the client.
 *
 * @param {carto.layer.Base[]} - The layer array to be added
 * @param {object} opts
 * @param {boolean} opts.reload - Default: true. A boolean flag controlling if the client should be reloaded
 *
 * @returns {Promise} A promise that will be fulfilled when the reload cycle is completed.
 * @api
 */
Client.prototype.addLayers = function (layers, opts) {
  opts = opts || {};
  layers.forEach(this._addLayer, this);
  if (opts.reload === false) {
    return Promise.resolve();
  }
  return this._engine.reload();
};

/**
 * Remove a layer from the client
 *
 * @param {carto.layer.Base} - The layer array to be removed
 * @param {object} opts
 * @param {boolean} opts.reload - Default: true. A boolean flag controlling if the client should be reloaded
 *
 * @returns {Promise} A promise that will be fulfilled when the reload cycle is completed.
 * @api
 */
Client.prototype.removeLayer = function (layer, opts) {
  opts = opts || {};
  this._layers.remove(layer);
  this._engine.removeLayer(layer.$getInternalModel());
  if (opts.reload === false) {
    return Promise.resolve();
  }
  return this._engine.reload();
};

/**
 * Get all the layers from the client
 *
 * @returns {carto.layer.Base[]} An array with all the Layers from the client.
 * @api
 */
Client.prototype.getLayers = function () {
  return this._layers.toArray();
};

/**
 * Add a dataview to the client.
 *
 * @param {carto.dataview.Base} - The dataview to be added
 * @param {boolean} opts.reload - Default: true. A boolean flag controlling if the client should be reloaded
 *
 * @returns {Promise} - A promise that will be fulfilled when the reload cycle is completed.
 * @api
 */
Client.prototype.addDataview = function (dataview, opts) {
  return this.addDataviews([dataview], opts);
};

/**
 * Add a dataview array to the client.
 *
 * @param {carto.dataview.Base[]} - The dataview array to be added
 * @param {object} opts
 * @param {boolean} opts.reload - Default: true. A boolean flag controlling if the client should be reloaded
 *
 * @returns {Promise} A promise that will be fulfilled when the reload cycle is completed.
 * @api
 */
Client.prototype.addDataviews = function (dataviews, opts) {
  opts = opts || {};
  dataviews.forEach(this._addDataview, this);
  if (opts.reload === false) {
    return Promise.resolve();
  }
  return this._engine.reload();
};

/**
 * Remove a dataview from the client
 *
 * @param {carto.dataview.Base} - The dataview array to be removed
 * @param {object} opts
 * @param {boolean} opts.reload - Default: true. A boolean flag controlling if the client should be reloaded
 *
 * @returns {Promise} A promise that will be fulfilled when the reload cycle is completed.
 * @api
 */
Client.prototype.removeDataview = function (dataview, opts) {
  opts = opts || {};
  this._dataviews.splice(this._dataviews.indexOf(dataview));
  this._engine.removeDataview(dataview.$getInternalModel());
  if (opts.reload === false) {
    return Promise.resolve();
  }
  return this._engine.reload();
};

/**
 * Get all the dataviews from the client
 *
 * @returns {carto.dataview.Base[]} An array with all the dataviews from the client.
 * @api
 */
Client.prototype.getDataviews = function () {
  return this._dataviews;
};

/**
 * ...
 */
Client.prototype.getLeafletLayerView = function () {
  this._leafletLayer = this._leafletLayer || new Leaflet.LayerGroup(this._layers, this._engine);
  return this._leafletLayer;
};

/**
 * Helper used to link a layer and an engine.
 * @private
 */
Client.prototype._addLayer = function (layer, engine) {
  this._layers.add(layer);
  layer.$setEngine(this._engine);
  this._engine.addLayer(layer.$getInternalModel());
};

/**
 * Helper used to link a dataview and an engine
 * @private
 */
Client.prototype._addDataview = function (dataview, engine) {
  this._dataviews.push(dataview);
  dataview.$setEngine(this._engine);
  this._engine.addDataview(dataview.$getInternalModel());
};

module.exports = Client;
