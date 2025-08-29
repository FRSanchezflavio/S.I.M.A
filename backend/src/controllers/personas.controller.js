const PersonasService = require('../services/personas.service');
const ExportService = require('../services/export.service');
const db = require('../db/knex');
const { asyncErrorHandler } = require('../middlewares/error');
const { NotFoundError } = require('../utils/errors');

// Initialize service
const personasService = new PersonasService(db);

/**
 * Searches personas with filtering, pagination, and export functionality
 * Supports CSV and XLSX export formats
 */
const search = asyncErrorHandler(async (req, res) => {
  const { format } = req.query;
  
  // Handle export requests
  if (ExportService.isExportRequest(format)) {
    const exportData = await personasService.getForExport(req.query);
    const columns = ExportService.getPersonasColumns();
    
    return ExportService.handleExport(
      res,
      format,
      exportData,
      columns,
      'personas',
      'Personas Registradas'
    );
  }
  
  // Handle regular search request
  const result = await personasService.searchPersonas(req.query);
  res.json(result);
});

/**
 * Creates a new persona with photo handling
 */
const create = asyncErrorHandler(async (req, res) => {
  const id = await personasService.create(req.body, req.files, req.user);
  res.status(201).json({ id });
});

/**
 * Gets a specific persona by ID with related registros
 */
const get = asyncErrorHandler(async (req, res) => {
  const persona = await personasService.getDetailsWithRegistros(req.params.id);
  
  if (!persona) {
    throw new NotFoundError('Persona');
  }
  
  res.json(persona);
});

/**
 * Updates a persona with photo handling
 */
const update = asyncErrorHandler(async (req, res) => {
  const success = await personasService.update(req.params.id, req.body, req.files, req.user);
  
  if (!success) {
    throw new NotFoundError('Persona');
  }
  
  res.json({ ok: true });
});

/**
 * Soft deletes a persona
 */
const remove = asyncErrorHandler(async (req, res) => {
  const success = await personasService.softDelete(req.params.id, req.user);
  
  if (!success) {
    throw new NotFoundError('Persona');
  }
  
  res.json({ ok: true });
});

/**
 * Gets personas statistics
 */
const getStats = asyncErrorHandler(async (req, res) => {
  const stats = await personasService.getStatistics();
  res.json(stats);
});

module.exports = {
  search,
  create,
  get,
  update,
  remove,
  getStats,
};
