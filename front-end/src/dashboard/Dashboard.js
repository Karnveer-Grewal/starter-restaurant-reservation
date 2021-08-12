// dependencies
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// local files
import './Dashboard.css';
import useQuery from '../utils/useQuery';
import ErrorAlert from '../layout/ErrorAlert';
import { listReservations } from '../utils/api';
import { today, next, previous } from '../utils/date-time';
import Reservation from '../reservations/Reservation';
import Table from '../tables/Table';
import Footer from '../layout/Footer';
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */

function Dashboard() {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  /* ----- useHistory, useQuery ----- */
  const history = useHistory();
  // if date props (today) is not passed in
  const query = useQuery();
  let date = query.get('date');

  if (!date) {
    date = today();
  }

  /* ----- state ----- */
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservation_date, setReservation_date] = useState(date);
  const [tables, setTables] = useState([]);

  /* ----- useEffect & loading API data ----- */
  // reservations
  useEffect(loadDashboard, [reservation_date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: reservation_date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const reservationsData = reservations.map((reservation) => (
    <Reservation key={reservation.reservation_id} reservation={reservation} />
  ));

  // tables
  useEffect(() => {
    const abortController = new AbortController();

    async function loadTables() {
      try {
        const response = await fetch(`${API_BASE_URL}/tables`, {
          signal: abortController.signal,
        });
        const tablesFromAPI = await response.json();
        setTables(tablesFromAPI.data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Aborted');
        } else {
          throw error;
        }
      }
    }
    loadTables();
    return () => abortController.abort();
  }, [API_BASE_URL]);

  const tablesData = tables.map((table) => (
    <Table key={table.table_id} table={table} />
  ));

  /* ----- event handlers ----- */
  const handleNextButton = () => {
    setReservation_date(next(reservation_date));
    history.push(`/dashboard/?date=${next(reservation_date)}`);
  };

  const handlePreviousButton = () => {
    setReservation_date(previous(reservation_date));
    history.push(`/dashboard/?date=${previous(reservation_date)}`);
  };

  const handleTodayButton = () => {
    setReservation_date(today());
    history.push(`/dashboard/${today()}`);
  };
  /* ----- render content ----- */
  return (
    <section className='Dashboard'>
      <ErrorAlert error={reservationsError} />
      {/* {JSON.stringify(reservations)} */}
      <h1>Dashboard</h1>
      <h2>{reservation_date}</h2>
      <section className='AllReservations'>
        <h3>Reservations</h3>
        <div className='buttons'>
          <button
            className='btn pink-btn'
            type='button'
            onClick={handlePreviousButton}
          >
            Previous
          </button>
          <button
            className='btn orange-btn'
            type='button'
            onClick={handleNextButton}
          >
            Next
          </button>
          <button
            className='btn lemon-lime-btn'
            type='button'
            onClick={handleTodayButton}
          >
            Today
          </button>
        </div>
        <div className='reservations-data'>{reservationsData}</div>
      </section>

      <section className='AllTables'>
        <div className='table-heading'>
          <h3>Tables</h3>
        </div>

        <div className='tables-data'>{tablesData}</div>
      </section>

      <Footer />
    </section>
  );
}

export default Dashboard;
