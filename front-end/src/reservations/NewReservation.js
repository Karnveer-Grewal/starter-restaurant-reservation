import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { today } from '../utils/date-time';
import ErrorAlert from '../layout/ErrorAlert';
import formatReservationTime from '../utils/format-reservation-time';

function NewReservation() {
  const history = useHistory();

  const initialFormState = {
    first_name: '',
    last_name: '',
    mobile_number: '',
    reservation_date: '',
    reservation_time: '',
    people: '',
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [formErrors, setFormErrors] = useState([]);

  const getReservationDay = () => {
    const year = formData.reservation_date.split('-')[0];
    const month = formData.reservation_date.split('-')[1] - 1;
    const day = formData.reservation_date.split('-')[2];
    const reservationDate = new Date(year, month, day);

    return reservationDate.getDay();
  };

  const reservationMinusTodayDate = () => {
    const reservationDate = formData.reservation_date.split('-').join('');
    const todayDate = today().split('-').join('');

    return reservationDate - todayDate;
  };

  const reservationTimeIsValid = () => {
    let result = false;
    const reservMinusTodayDate = reservationMinusTodayDate();

    const reservationTime = Number(
      formatReservationTime(formData).reservation_time.split(':').join('')
    );
    let todayTime = new Date();
    let todayHours = String(todayTime.getHours());
    let todayMinutes = String(todayTime.getMinutes());

    if (todayHours < 10) todayHours = '0' + todayHours;
    if (todayMinutes < 10) todayMinutes = '0' + todayMinutes;

    todayTime = Number(todayHours + todayMinutes);

    if (reservationTime >= 1030 && reservationTime <= 2130) {
      result = true;
      if (reservMinusTodayDate === 0) {
        if (reservationTime > todayTime) {
          result = true;
        } else result = false;
      }
    }

    return result;
  };

  const formValidation = () => {
    const reservationDateTuesdayCheck = getReservationDay();
    const reservMinusTodayDate = reservationMinusTodayDate();
    const reservationTimeIsValidCheck = reservationTimeIsValid();

    const array = [];

    // check if reservation_date is on Tuesday
    if (reservationDateTuesdayCheck === 2)
      array.push('We are closed on Tuesdays. No reservations allowed.');

    //check if reservation_date is in the past
    if (reservMinusTodayDate < 0)
      array.push('The reservation must be for today or a future date!');

    // check if reservation_time is valid
    if (!reservationTimeIsValidCheck)
      array.push(
        'The reservation time must be between 10:30AM - 9:30PM, and cannot be less than current time!'
      );

    return array;
  };

  //EVENT HANDLERS
  //handle input change on form
  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };
  console.log(formData);
  console.log('Errors', formErrors);

  //handle cancel button to go back
  const handleCancelButton = () => {
    history.goBack();
  };

  //handle submit button to submit form
  const handleSubmit = (event) => {
    event.preventDefault();

    const runFormValidation = formValidation();

    setFormErrors(runFormValidation);

    if (!runFormValidation.length) {
      const url = 'http://localhost:5000/reservations';
      const data = { data: formData };

      axios
        .post(url, data)
        .then(() => {
          history.push(`/dashboard/?date=${formData.reservation_date}`);
        })
        .catch((err) => {
          console.error(err);
        });

      console.log('Submitted:', formData);
      setFormData({ ...initialFormState });
    }
  };

  //FORM JSX
  return (
    <section>
      {formErrors.map((error, index) => {
        console.log(error);
        return <ErrorAlert key={index} error={error} />;
      })}
      <form onSubmit={handleSubmit}>
        <label htmlFor='first_name'>
          First Name:
          <input
            id='first_name'
            type='text'
            name='first_name'
            required
            onChange={handleChange}
            value={formData.first_name}
          />
        </label>
        <br />
        <label htmlFor='last_name'>
          Last Name:
          <input
            id='last_name'
            type='text'
            name='last_name'
            required
            onChange={handleChange}
            value={formData.last_name}
          />
        </label>
        <br />
        <label htmlFor='mobile_number'>
          Mobile Number:
          <input
            type='tel'
            id='mobile_number'
            name='mobile_number'
            placeholder='123-456-7890'
            onChange={handleChange}
            value={formData.mobile_number}
            required
          ></input>
        </label>
        <br />
        <label htmlFor='reservation_date'>
          Reservation Date:
          <input
            id='reservation_date'
            type='date'
            name='reservation_date'
            placeholder='YYYY-MM-DD'
            pattern='\d{4}-\d{2}-\d{2}'
            required
            onChange={handleChange}
            value={formData.reservation_date}
          />
        </label>
        <br />
        <label htmlFor='reservation_time'>
          Reservation Time:
          <input
            id='reservation_time'
            type='time'
            name='reservation_time'
            placeholder='HH:MM'
            pattern='[0-9]{2}:[0-9]{2}'
            //   min="10:30"
            //   max="21:30"
            required
            onChange={handleChange}
            value={formData.reservation_time}
          />
        </label>
        <br />
        <label htmlFor='people'>
          Number of People:
          <input
            id='people'
            type='number'
            name='people'
            min='1'
            required
            onChange={handleChange}
            value={formData.people}
          />
        </label>
        <br />

        <button type='submit'>Submit</button>
        <button type='button' onClick={handleCancelButton}>
          Cancel
        </button>
      </form>
    </section>
  );
}

export default NewReservation;
