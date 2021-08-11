const reservationsService = require('./reservations.service');
const hasProperties = require('../errors/hasProperties');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const query = req.query;
  const data = await reservationsService.list(query);
  res.status(200).json({
    data,
  });
}

//valid properties array
const VALID_PROPERTIES = [
  'first_name',
  'last_name',
  'mobile_number',
  'reservation_date',
  'reservation_time',
  'people',
];

//validation properties middleware

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

//required properties middleware
const hasRequiredProperties = hasProperties(
  'first_name',
  'last_name',
  'mobile_number',
  'reservation_date',
  'reservation_time',
  'people'
);

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

function reservationTimeConstraint(req, res, next) {
  const { reservation_time } = req.body.data;
  console.log(reservation_time);
  const addedSeconds = `${reservation_time}:00`;
  if (addedSeconds < '10:30:00' || addedSeconds > '21:30:00') {
    return next({
      status: 400,
      message: 'Selected time is not between 10:30 am and 9:30 pm.',
    });
  }
  next();
}

//middleware to check if reservation_date is valid date
function hasValidDate(req, res, next) {
  const { data = {} } = req.body;
  console.log(data.reservation_date);
  const validDate = data.reservation_date;
  const year = validDate.substring(0, 4);
  const month = validDate.substring(5, 7);
  const date = validDate.substring(8, 10);

  const parsedDate = Date.parse(validDate);
  console.log(parsedDate);
  if (isNaN(parsedDate)) {
    return next({
      status: 400,
      message: 'Not a valid reservation_date',
    });
  } else {
    next();
  }
}

//middleware to see if date is not in past
function dateNotInPast(req, res, next) {
  const { reservation_date } = req.body.data;
  const compareDate = new Date(reservation_date);
  const today = new Date();
  const todaysDate = today.getDate() - 1;
  today.setDate(todaysDate);
  if (today > compareDate) {
    return next({
      status: 400,
      message: 'Date selected must only be in the future',
    });
  }
  next();
}

//date not on a tuesday
function dateNotOnTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const date = new Date(reservation_date);
  const dayValue = date.getDay();
  console.log(dayValue);
  if (dayValue === 1) {
    return next({
      status: 400,
      message: 'We are closed on Tuesday. Please select a valid date.',
    });
  }
  next();
}

//middleware to have atleast 1 person to make reservation
const hasValidNumberPeople = (req, res, next) => {
  console.log('this code is running');
  const { people } = req.body.data;
  const validNumber = Number(people);
  if (typeof validNumber !== 'number' || validNumber < 1) {
    return next({
      status: 400,
      message:
        'Amount of people for party size must be a integer/whole number of at least 1.',
    });
  } else {
    next();
  }
};

//create function for making a new reservation
async function create(req, res, next) {
  const data = await reservationsService.create(req.body.data);

  res.status(201).json({ data });
}

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

async function read(_, res) {
  const { reservation_id } = res.locals.reservation;
  const data = await service.read(reservation_id);

  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidDate,
    dateNotInPast,
    dateNotOnTuesday,
    reservationTimeIsCorrectFormat,
    reservationTimeConstraint,
    hasValidNumberPeople,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
};
