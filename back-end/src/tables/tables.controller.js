const service = require('./tables.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const hasProperties = require('../errors/hasProperties');

/* ----- VALIDATION MIDDLEWARE ----- */
// checks if reservation has these properties
const hasRequiredTableProperties = hasProperties('table_name', 'capacity');
const hasRequiredReservationIdProperty = hasProperties('reservation_id');

// checks if table_name property has more than 1 char
function tableNameMoreThanOneChar(req, _, next) {
  const { table_name } = req.body.data;

  if (table_name.length > 1) next();
  else {
    const error = new Error(`table_name must be more than 1 character long!`);
    error.status = 400;
    throw error;
  }
}

// checks if table exists
async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);

  if (table) {
    res.locals.table = table;
    next();
  } else {
    const error = new Error(`Table with table id ${table_id} does not exist.`);
    error.status = 404;
    throw error;
  }
}

// checks if reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await service.readReservationId(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    next();
  } else {
    const error = new Error(
      `Reservation with reservation id ${reservation_id} does not exist.`
    );
    error.status = 404;
    throw error;
  }
}

// checks if table_capacity property has sufficient capacity (reservation.people <= table.capacity)
function sufficientCapacity(_, res, next) {
  const table = res.locals.table;
  const reservation = res.locals.reservation;

  if (reservation.people <= table.capacity) next();
  else {
    const error = new Error(
      `The reservation's number of people exceeds the table capacity!`
    );
    error.status = 400;
    throw error;
  }
}

// checks if table is not occupied by anyone (reservation_id === null), then go ahead and add reservation_id
function tableIsNotOccupied(_, res, next) {
  const table = res.locals.table;

  if (!table.reservation_id) next();
  else {
    const error = new Error(`The table is occupied.`);
    error.status = 400;
    throw error;
  }
}

// checks if the reservation does not have status property of 'seated'
function reservationHasHasNotBeenSeated(_, res, next) {
  const reservation = res.locals.reservation;
  if (reservation.status !== 'seated') next();
  else {
    const error = new Error(`This reservation is already seated.`);
    error.status = 400;
    throw error;
  }
}

// checks if table is occupied (reservation_id has value), then go ahead and delete reservation_id
function tableIsOccupied(_, res, next) {
  const table = res.locals.table;

  if (table.reservation_id) next();
  else {
    const error = new Error(`The table is not occupied; nothing to delete.`);
    error.status = 400;
    throw error;
  }
}

/* ----- CRUDL ----- */
async function create(req, res) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

async function read(_, res) {
  const { table_id } = res.locals.table;
  const data = await service.read(table_id);

  res.json({ data });
}

// also updates reservation's status property to 'seated'
async function updateReservationStatusToSeated(_, res, next) {
  const { reservation_id } = res.locals.reservation;

  await service.updateReservationStatusToSeated(reservation_id);
  next();
}

// also updates reservation's status property to 'finished'
async function updateReservationStatusToFinished(req, res, next) {
  const { reservation_id } = res.locals.table;

  await service.updateReservationStatusToFinished(reservation_id);
  next();
}

async function update(req, res) {
  const { table_id } = req.params;
  const data = await service.update(table_id, req.body.data);

  res.json({ data });
}

async function list(_, res) {
  const data = await service.list();

  res.json({ data });
}

async function destroy(_, res) {
  const { table_id } = res.locals.table;

  await service.delete(table_id);
  res.sendStatus(200);
}

module.exports = {
  create: [
    hasRequiredTableProperties,
    tableNameMoreThanOneChar,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  update: [
    hasRequiredReservationIdProperty,
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    sufficientCapacity,
    tableIsNotOccupied,
    reservationHasHasNotBeenSeated,
    asyncErrorBoundary(updateReservationStatusToSeated),
    asyncErrorBoundary(update),
  ],
  delete: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(updateReservationStatusToFinished),
    asyncErrorBoundary(destroy),
  ],
  list: asyncErrorBoundary(list),
};
