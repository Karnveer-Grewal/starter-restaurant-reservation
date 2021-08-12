const service = require('./reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const hasProperties = require('../errors/hasProperties');

/* ----- VALIDATION MIDDLEWARE ----- */
// checks if table has these properties
const hasRequiredFormProperties = hasProperties(
  'first_name',
  'last_name',
  'mobile_number',
  'reservation_date',
  'reservation_time',
  'people'
);

// checks if reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

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

// first check req.body (status || form) checks if table has properties
function checkRequiredProperties(req, res, next) {
  const { data } = req.body;

  // if data has form data
  if (Object.keys(data).length > 1) {
    hasRequiredFormProperties(req, res, next);
  } else {
    next();
  }
}

// checks if people property is a number
function peoplePropertyIsNumber(req, _, next) {
  const { data } = req.body;
  console.log(data.people);
  console.log(typeof data.people);
  // ignore if req.body is only status
  if (Object.keys(data).length === 1) next();
  else {
    if (typeof req.body.data.people === 'number') next();
    else {
      const error = new Error(`people property must be a number!`);
      error.status = 400;
      throw error;
    }
  }
}

// checks if reservation_date property is in correct format: YYYY-MM-DD
function reservationDateIsCorrect(req, _, next) {
  const { data } = req.body;

  // ignore if req.body is only status
  if (Object.keys(data).length === 1) next();
  else {
    let regEx = /^\d{4}-\d{2}-\d{2}$/;
    let stored = req.body.data.reservation_date.match(regEx) != null;

    if (stored) next();
    else {
      const error = new Error(
        `The reservation_date must be in correct format: YYYY-MM-DD`
      );
      error.status = 400;
      throw error;
    }
  }
}

// checks if reservation_date property is on a Tuesday
function reservationDateIsTuesday(req, _, next) {
  const { reservation_date } = req.body.data;
  let formattedReservationDate = new Date();
  let reqBodyReservationDate = reservation_date.split('-');

  formattedReservationDate.setFullYear(Number(reqBodyReservationDate[0]));
  formattedReservationDate.setMonth(Number(reqBodyReservationDate[1] - 1));
  formattedReservationDate.setDate(Number(reqBodyReservationDate[2]));

  if (formattedReservationDate.getDay() === 2) {
    const error = new Error(
      'We are closed on Tuesdays. No reservations allowed.'
    );
    error.status = 400;
    throw error;
  } else next();
}

// checks if reservation_date property is for today or in future (can't be in past)
function reservationDateIsFuture(req, _, next) {
  let { reservation_date } = req.body.data;
  const newDate = new Date();
  const year = String(newDate.getFullYear());
  let month = String(newDate.getMonth() + 1);
  let day = String(newDate.getDate());

  if (month < 10) month = '0' + month;

  if (day < 10) day = '0' + day;

  reservation_date = reservation_date.split('-').join('');

  const todayDate = year + month + day;

  if (reservation_date < todayDate) {
    const error = new Error(
      'The reservation_date must be for today or a future date!'
    );
    error.status = 400;
    throw error;
  } else next();
}

// checks if reservation_time property is correctly formatted: HH:MM:SS or HH:MM
function reservationTimeIsCorrectFormat(req, _, next) {
  const { data } = req.body;

  // ignore if req.body is only status
  if (Object.keys(data).length === 1) next();
  else {
    let regEx = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;
    let regEx2 = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;

    let stored = req.body.data.reservation_time.match(regEx) != null;
    let stored2 = req.body.data.reservation_time.match(regEx2) != null;

    if (stored || stored2) next();
    else {
      const error = new Error(
        `The reservation_time must be in correct format: HH:MM:SS`
      );
      error.status = 400;
      throw error;
    }
  }
}

// checks if reservation_time property is between 10:30AM - 9:30PM
function reservationTimeIsValid(req, _, next) {
  let { reservation_time } = req.body.data;
  reservation_time = reservation_time.split(':').join('');

  // format is HHMMSS
  if (reservation_time.length === 6) {
    if (reservation_time >= 103000 && reservation_time <= 213000) next();
    else {
      const error = new Error(
        `The reservation_time must be between 10:30AM - 9:30PM!`
      );
      error.status = 400;
      throw error;
    }
  }
  // format is HHMM
  if (reservation_time.length === 4) {
    if (reservation_time >= 1030 && reservation_time <= 2130) next();
    else {
      const error = new Error(
        `The reservation_time must be between 10:30AM - 9:30PM!`
      );
      error.status = 400;
      throw error;
    }
  }
}

// checks if status property is only booked
function reservationStatusIsOnlyBooked(req, _, next) {
  const { status } = req.body.data;

  if (status) {
    if (status === 'booked') return next();
    else {
      const error = new Error(
        `The reservation must have status of booked: cannot be seated or finished.`
      );
      error.status = 400;
      throw error;
    }
  }
  // go next if req.body doesn't have status property (the db will add status to 'booked' as default)
  next();
}

// checks if status property is 'booked', 'seated', or 'finished'
function reservationStatusIsValid(req, _, next) {
  const { status } = req.body.data;

  if (
    status === 'booked' ||
    status === 'seated' ||
    status === 'finished' ||
    status === 'cancelled'
  )
    next();
  else {
    const error = new Error(
      `Reservation status is unknown: The reservation status must be 'booked', 'seated', 'finished', or 'cancelled'.`
    );
    error.status = 400;
    throw error;
  }
}

// checks if status property is not 'finished' (can't update a finished reservation)
function reservationStatusIsNotFinished(req, res, next) {
  const reservationStatus = res.locals.reservation.status;
  const bodyStatus = req.body.data.status;

  /* ----- // Cases: ----- */
  // 1) GOOD: seat button is clicked => reservationStatus & bodyStatus are 'seated' so go next()
  // 2) GOOD: finish button is clicked => reservationStatus & bodyStatus are 'finished' so return next()
  // 3) BAD: updates when reservationStatus is 'finished', but bodyStatus is not 'finished' (changing a finished reservation) throw error
  if (reservationStatus === 'finished') {
    // if the status of req.body is anything other than 'finished', throw error
    if (bodyStatus !== 'finished') {
      const error = new Error(
        `The reservation status must not be finished: Cannot update a finished reservation.`
      );
      error.status = 400;
      throw error;
    } else return next();
  }
  next();
}

/* ----- CRUDL ----- */
async function create(req, res) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

async function read(_, res) {
  const { reservation_id } = res.locals.reservation;
  const data = await service.read(reservation_id);

  res.json({ data });
}

async function update(req, res) {
  const { reservation_id } = res.locals.reservation;
  const data = await service.update(reservation_id, req.body.data);

  res.json({ data });
}

async function list(req, res) {
  const query = req.query;
  const data = await service.list(query);

  res.json({ data });
}

module.exports = {
  create: [
    hasRequiredFormProperties,
    peoplePropertyIsNumber,
    reservationDateIsCorrect,
    reservationDateIsTuesday,
    reservationDateIsFuture,
    reservationTimeIsCorrectFormat,
    reservationTimeIsValid,
    reservationStatusIsOnlyBooked,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(reservationExists),
    checkRequiredProperties,
    reservationDateIsCorrect,
    reservationTimeIsCorrectFormat,
    peoplePropertyIsNumber,
    reservationStatusIsValid,
    reservationStatusIsNotFinished,
    asyncErrorBoundary(update),
  ],
  list: asyncErrorBoundary(list),
};
