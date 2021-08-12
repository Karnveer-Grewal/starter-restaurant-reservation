// dependencies
import React from 'react';
import { useHistory } from 'react-router-dom';
// local files
import './Form.css';
import formatReservationDate from '../utils/format-reservation-date';

const Form = ({ formData, setFormData, handleFormSubmit }) => {
  /* ----- useHistory ----- */
  const history = useHistory();

  // reservationDateFormat(obj);
  formatReservationDate(formData);

  /* ----- event handlers ----- */
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleNumberChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: Number(event.target.value),
    });
  };

  const handleCancelButton = () => {
    history.goBack();
  };

  /* ----- render content ----- */
  return (
    <form className='Form' onSubmit={handleFormSubmit}>
      <div className='form-group'>
        <label htmlFor='first_name'>
          <span>First name:</span>
          <input
            id='first_name'
            className='form-control'
            type='text'
            name='first_name'
            value={formData.first_name}
            onChange={handleChange}
            placeholder='First Name'
            required
          />
        </label>
        <label htmlFor='last_name'>
          <span>Last name:</span>
          <input
            id='last_name'
            className='form-control'
            type='text'
            name='last_name'
            value={formData.last_name}
            onChange={handleChange}
            placeholder='Last Name'
            required
          />
        </label>
        <label htmlFor='mobile_number'>
          <span>Mobile Number:</span>
          <input
            id='mobile_number'
            className='form-control'
            type='tel'
            name='mobile_number'
            value={formData.mobile_number}
            onChange={handleChange}
            required
          />
        </label>
        <label htmlFor='reservation_date'>
          <span>Reservation Date:</span>
          <input
            id='reservation_date'
            className='form-control'
            type='date'
            name='reservation_date'
            pattern='\d{4}-\d{2}-\d{2}'
            value={formData.reservation_date}
            onChange={handleChange}
            placeholder='YYYY-MM-DD'
            required
          />
        </label>
        <label htmlFor='reservation_time'>
          <span>Reservation Time:</span>
          <input
            id='reservation_time'
            className='form-control'
            type='time'
            name='reservation_time'
            value={formData.reservation_time}
            onChange={handleChange}
            placeholder='HH:MM'
            required
          />
        </label>
        <label htmlFor='people'>
          <span>People:</span>
          <input
            id='people'
            className='form-control'
            type='number'
            name='people'
            value={formData.people}
            onChange={handleNumberChange}
            required
          />
        </label>
        <div className='buttons'>
          <button className='btn brown-btn' type='submit'>
            Submit
          </button>
          <button
            className='btn red-btn'
            type='button'
            onClick={handleCancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default Form;
