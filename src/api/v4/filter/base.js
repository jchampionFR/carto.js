var _ = require('underscore');
var Backbone = require('backbone');
var CartoValidationError = require('../error-handling/carto-validation-error');

/**
 * Base filter object
 *
 * @constructor
 * @abstract
 * @memberof carto.filter
 * @api
 */
function Base () {}

_.extend(Base.prototype, Backbone.Events);

Base.prototype._getValidationError = function (code) {
  return new CartoValidationError('filter', code);
};

module.exports = Base;

/**
 * Fired when bounds have changed. Handler gets a parameter with the new bounds.
 *
 * @event boundsChanged
 * @type {carto.filter.Bounds}
 * @api
 */

/**
 * Fired when circle filter has changed. Handler gets a parameter with the new circle.
 *
 * @event circleChanged
 * @type {carto.filter.CircleData}
 * @api
 */

/**
 * Fired when polygon filter has changed. Handler gets a parameter with the new polygon.
 *
 * @event polygonChanged
 * @type {carto.filter.PolygonData}
 * @api
 */
