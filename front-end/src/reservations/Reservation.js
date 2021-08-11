import { Link } from 'react-router-dom';
import { formatAsTime } from '../utils/date-time';

function Reservation({ reservation }) {
  return (
    <div className='Reservation'>
      <div className='card'>
        <div className='card-body'>
          <h5 className='card-title reservation-name'>
            {reservation.first_name} {reservation.last_name}
          </h5>
          <p
            className='card-text'
            data-reservation-id-status={reservation.reservation_id}
          >
            <strong>Status:</strong> {reservation.status}
          </p>
          <p className='card-text'>
            <strong>Phone Number:</strong> {reservation.mobile_number}
          </p>
          <p className='card-text'>
            <strong>Reservation Time:</strong> {reservation.reservation_time}
          </p>
          <p className='card-text'>
            <strong>People:</strong> {reservation.people}
          </p>
          {reservation.status === 'booked' ? (
            <p className='card-text'>
              <Link to={`/reservations/${reservation.reservation_id}/seat`}>
                <button className='btn btn-seat' type='button'>
                  Seat
                </button>
              </Link>
            </p>
          ) : null}
          <p className='card-text'>
            {/* <Link to={`/reservations/${reservation.reservation_id}/edit`}>
              <button className='btn btn-edit' type='button'>
                Edit
              </button>
            </Link> */}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
