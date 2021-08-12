// dependencies
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
// local files
import './Reservation.css';

const Reservation = ({ reservation }) => {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  /* ----- useHistory ----- */
  const history = useHistory();

  /* ----- event handlers ----- */
  const handleCancelButton = async (reservation_id) => {
    const confirm = window.confirm(
      'Do you want to cancel this reservation? This cannot be undone.'
    );

    // if cancel is clicked, do nothing
    if (!confirm) return;
    // if ok is clicked, set status to cancelled
    try {
      const reservationUrl = `${API_BASE_URL}/reservations/${reservation_id}/status`;
      const statusData = {
        data: {
          status: 'cancelled',
        },
      };

      await axios.put(reservationUrl, statusData);
      history.go(0);
    } catch (error) {
      console.log(error);
    }
  };

  /* ----- render content ----- */
  return (
    <div className='Reservation'>
      <div className='card'>
        <div className='card-body'>
          <h5 className='card-title reservation-name'>
            {reservation.first_name} {reservation.last_name}
          </h5>
          <p
            className='card-text reservation-id reservation-status'
            data-reservation-id-status={reservation.reservation_id}
          >
            <strong>Status:</strong> {reservation.status}
          </p>
          <p className='card-text reservation-mobile-number'>
            <strong>Phone Number:</strong> {reservation.mobile_number}
          </p>
          <p className='card-text reservation-time'>
            <strong>Reservation Time:</strong> {reservation.reservation_time}
          </p>
          <p className='card-text reservation-people'>
            <strong>People:</strong> {reservation.people}
          </p>
          {/* Only when reservation status is booked, show 3 buttons */}
          {reservation.status === 'booked' ? (
            <p className='card-text buttons'>
              <Link to={`/reservations/${reservation.reservation_id}/seat`}>
                <button className='btn yellow-btn' type='button'>
                  Seat
                </button>
              </Link>
              <Link to={`/reservations/${reservation.reservation_id}/edit`}>
                <button className='btn brown-btn' type='button'>
                  Edit
                </button>
              </Link>
              <button
                data-reservation-id-cancel={reservation.reservation_id}
                className='btn red-btn'
                type='button'
                onClick={() => handleCancelButton(reservation.reservation_id)}
              >
                Cancel
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Reservation;
