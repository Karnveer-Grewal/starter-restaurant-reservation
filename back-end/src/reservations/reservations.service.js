const knex = require('../db/connection');
const tableName = 'reservations';

function create(reservation) {
  return knex(tableName)
    .insert(reservation)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

function read(reservation_id) {
  return knex(tableName).select('*').where({ reservation_id }).first();
}

function update(reservation_id, status) {
  return knex(tableName)
    .where({ reservation_id })
    .update(status, '*')
    .then((createdRecords) => createdRecords[0]);
}

function list(query) {
  if (query.date) {
    return knex(tableName)
      .select('*')
      .orderBy('reservation_time', 'asc')
      .where('reservation_date', query.date)
      .andWhere({ status: 'booked' })
      .orWhere({ status: 'seated' });
  }
  if (query.mobile_number) {
    return knex(tableName)
      .select('*')
      .where('mobile_number', 'like', `${query.mobile_number}%`);
  }
  return knex(tableName)
    .select('*')
    .orderBy('reservation_date', 'asc')
    .orderBy('reservation_time', 'asc')
    .where({ status: 'booked' })
    .orWhere({ status: 'seated' });
}

module.exports = {
  create,
  read,
  update,
  list,
};
