const RegistrosService = require('../services/registros.service');
const ExportService = require('../services/export.service');
const db = require('../db/knex');
const { asyncErrorHandler } = require('../middlewares/error');
const { NotFoundError } = require('../utils/errors');

// Initialize service
const registrosService = new RegistrosService(db);

/**
 * Lists registros with filtering, pagination, and export functionality
 * Supports CSV and XLSX export formats
 */
const list = asyncErrorHandler(async (req, res) => {
  const { format } = req.query;
  
  // Handle export requests
  if (ExportService.isExportRequest(format)) {
    const exportData = await registrosService.getForExport(req.query);
    const columns = ExportService.getRegistrosColumns();
    
    return ExportService.handleExport(
      res,
      format,
      exportData,
      columns,
      'registros',
      'Registros Delictuales'
    );
  }
  
  // Handle regular list request
  const result = await registrosService.searchRegistros(req.query);
  res.json(result);
});

/**
 * Creates a new registro delictual
 */
const create = asyncErrorHandler(async (req, res) => {
  const id = await registrosService.create(req.body, req.user);
  res.status(201).json({ id });
});

/**
 * Gets a specific registro by ID with related data
 */
const get = asyncErrorHandler(async (req, res) => {
  const registro = await registrosService.getDetails(req.params.id);
  
  if (!registro) {
    throw new NotFoundError('Registro');
  }
  
  res.json(registro);
});

/**
 * Updates a registro delictual
 */
const update = asyncErrorHandler(async (req, res) => {
  const success = await registrosService.update(req.params.id, req.body, req.user);
  
  if (!success) {
    throw new NotFoundError('Registro');
  }
  
  res.json({ ok: true });
});

/**
 * Soft deletes a registro delictual  
 */
const remove = asyncErrorHandler(async (req, res) => {
  const success = await registrosService.softDelete(req.params.id, req.user);
  
  if (!success) {
    throw new NotFoundError('Registro');
  }
  
  res.json({ ok: true });
});

/**
 * Duplicates a registro delictual
 */
const duplicate = asyncErrorHandler(async (req, res) => {
  const newId = await registrosService.duplicate(req.params.id, req.user);
  res.status(201).json({ id: newId });
});

module.exports = {
  list,
  create,
  get,
  update,
  remove,
  duplicate,
};
