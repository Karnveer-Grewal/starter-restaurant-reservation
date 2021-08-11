import React, { useEffect, useState } from 'react';
import { listReservations } from '../utils/api';
import ErrorAlert from '../layout/ErrorAlert';
import { next, previous, today } from '../utils/date-time';
import { useHistory } from 'react-router';
import Reservation from '../reservations/Reservation';

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const history = useHistory();
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservationDate, setReservationDate] = useState(date);
  console.log(reservationDate);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: reservationDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const reservationsData = reservations.map((reservation) => (
    <Reservation key={reservation.reservation_id} reservation={reservation} />
  ));

  //handle click of Next Button
  const handleNext = () => {
    setReservationDate(next(reservationDate));
    history.push(`/dashboard?date=${next(reservationDate)}`);
  };

  const handlePrevious = () => {
    setReservationDate(previous(reservationDate));
    history.push(`/dashboard?date=${previous(reservationDate)}`);
  };

  const handleToday = () => {
    setReservationDate(today());
    history.push(`/dashboard?date=${today()}`);
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className='d-md-flex mb-3'>
        <h4 className='mb-0'>Reservations for {reservationDate}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <div className='container'>{reservationsData}</div>
      {/* {JSON.stringify(reservations)} */}
      <button onClick={handlePrevious}>Previous</button>

      <button onClick={handleToday}>Today</button>

      <button onClick={handleNext}>Next</button>
    </main>
  );
}

export default Dashboard;
