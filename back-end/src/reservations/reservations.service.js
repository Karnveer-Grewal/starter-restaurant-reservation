const knex = require('../db/connection');

function list(query) {
  return knex('reservations')
    .select('*')
    .orderBy('reservation_time', 'asc')
    .where('reservation_date', query.date);
}

function create(reservation) {
  return knex('reservations')
    .insert(reservation)
    .returning('*')
    .then((createReservation) => createReservation[0]);
}

module.exports = {
  list,
  create,
};
