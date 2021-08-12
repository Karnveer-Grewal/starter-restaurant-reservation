const knex = require('../db/connection');
const tableName = 'tables';
const reservationName = 'reservations';

function create(table) {
  return knex(tableName)
    .insert(table)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

function read(table_id) {
  return knex(tableName).select('*').where({ table_id }).first();
}

function readReservationId(reservation_id) {
  return knex(reservationName).select('*').where({ reservation_id }).first();
}

function update(table_id, reservation_id) {
  return knex(tableName)
    .where({ table_id })
    .update(reservation_id, '*')
    .then((createdRecord) => createdRecord[0]);
}

function updateReservationStatusToSeated(reservation_id) {
  return knex(reservationName)
    .where({ reservation_id })
    .update({ status: 'seated' })
    .then((createdRecord) => createdRecord[0]);
}

function updateReservationStatusToFinished(reservation_id) {
  return knex(reservationName)
    .where({ reservation_id })
    .update({ status: 'finished' })
    .then((createdRecord) => createdRecord[0]);
}

function destroy(table_id) {
  return knex(tableName)
    .select('*')
    .where({ table_id })
    .update({ reservation_id: null });
}

function list() {
  return knex(tableName).select('*').orderBy('table_name', 'asc');
}

module.exports = {
  create,
  read,
  readReservationId,
  update,
  updateReservationStatusToSeated,
  updateReservationStatusToFinished,
  delete: destroy,
  list,
};
