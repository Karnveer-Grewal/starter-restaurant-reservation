const service = require('./tables.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const hasProperties = require('../errors/hasProperties');

//LIST: tables list function
async function list(_, res) {
  const data = await service.list();

  res.json({ data });
}

//CREATE: tables create function to create new table
async function create(req, res) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

//CREATE: checks to see if table being created has required properties
const hasRequiredTableProperties = hasProperties('table_name', 'capacity');

//CREATE: valid properties array
const VALID_PROPERTIES = ['table_name', 'capacity'];

//CREATE: checks to see if req.body has only certain properties
function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(', ')}`,
    });
  }
  next();
}

//CREATE: checks if table_name property has more than 1 char
function tableNameMoreThanOneChar(req, _, next) {
  const { table_name } = req.body.data;

  if (table_name.length <= 1) {
    return next({
      status: 400,
      message: 'table_name must be more than 1 character long!',
    });
  }

  next();
}

//CREATE: checks if capacity is not a number
function isCapacityNumber(req, res, next) {
  const { capacity } = req.body.data;
  console.log(capacity);
  console.log(typeof capacity);
  if (typeof capacity !== 'number') {
    return next({ status: 400, message: 'capacity is not a number' });
  }
  next();
}

//READ: read function to find table id
async function read(_, res) {
  const { table_id } = res.locals.table;
  const data = await service.read(table_id);

  res.json({ data });
}

//READ: checks if table exists
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

//UPDATE: function to update
async function update(req, res) {
  const { table_id } = req.params;
  const data = await service.update(table_id, req.body.data);

  res.json({ data });
}

//UPDATE:
const hasRequiredReservationIdProperty = hasProperties('reservation_id');

//UPDATE: checks to see if reservation exists
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

//UPDATE: checks if table_capacity property has sufficient capacity (reservation.people <= table.capacity)
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

//UPDATE: checks if table is not occupied by anyone (reservation_id === null), then go ahead and add reservation_id
function tableIsNotOccupied(_, res, next) {
  const table = res.locals.table;

  if (!table.reservation_id) next();
  else {
    const error = new Error(`The table is occupied.`);
    error.status = 400;
    throw error;
  }
}

//UPDATE: checks if the reservation does not have status property of 'seated'
function reservationHasHasNotBeenSeated(_, res, next) {
  const reservation = res.locals.reservation;
  if (reservation.status !== 'seated') next();
  else {
    const error = new Error(`This reservation is already seated.`);
    error.status = 400;
    throw error;
  }
}

//UPDATE: updates reservation's status property to 'seated'
async function updateReservationStatusToSeated(_, res, next) {
  const { reservation_id } = res.locals.reservation;

  await service.updateReservationStatusToSeated(reservation_id);
  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  create: [
    hasOnlyValidProperties,
    hasRequiredTableProperties,
    tableNameMoreThanOneChar,
    isCapacityNumber,
    asyncErrorBoundary(create),
  ],
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
};
