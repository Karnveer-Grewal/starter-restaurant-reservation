/* eslint-disable react-hooks/exhaustive-deps */
// dependencies
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
// local files
import './EditReservation.css';
import ErrorAlert from '../layout/ErrorAlert';
import { today } from '../utils/date-time';
import formatReservationTime from '../utils/format-reservation-time';
import Form from '../layout/Form';
import Footer from '../layout/Footer';

const EditReservation = () => {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  /* ----- useParams, useHistory ----- */
  const { reservation_id } = useParams();
  const history = useHistory();

  /* ----- state ----- */
  const [reservation, setReservation] = useState({});
  const [formErrors, setFormErrors] = useState([]);

  /* ----- useEffect & loading API data ----- */
  useEffect(() => {
    const abortController = new AbortController();

    async function loadReservation() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/reservations/${reservation_id}`,
          {
            signal: abortController.signal,
          }
        );
        const reservationFromAPI = await response.json();
        setReservation(reservationFromAPI.data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Aborted');
        } else {
          throw error;
        }
      }
    }
    loadReservation();
    return () => abortController.abort();
  }, [reservation_id]);

  /* ----- helper functions ----- */
  // checks if mobile_number is in proper format: all numbers XXX-XXX-XXXX
  const mobileNumberFormat = () => {
    let regExp7 = /^\(?([0-9]{3})\)?[-]?([0-9]{4})$/;
    let regExp10 = /^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/;
    let match7 = reservation.mobile_number.match(regExp7);
    let match10 = reservation.mobile_number.match(regExp10);

    if (match7 || match10) return true;
    return false;
  };

  // returns the specific reservation_date as a number example: sun = 0, tues = 2, sat = 6
  const getReservationDay = () => {
    const year = reservation.reservation_date.split('-')[0];
    const month = reservation.reservation_date.split('-')[1] - 1;
    const day = reservation.reservation_date.split('-')[2];
    const reservationDate = new Date(year, month, day);

    return reservationDate.getDay();
  };

  // returns positive number if reservation_date is > today
  const reservationMinusTodayDate = () => {
    const reservationDate = reservation.reservation_date.split('-').join('');
    const todayDate = today().split('-').join('');

    return reservationDate - todayDate;
  };

  // if reservation_time is within bounds, returns true
  const reservationTimeIsValid = () => {
    let result = false;
    const reservMinusTodayDate = reservationMinusTodayDate();

    const reservationTime = Number(
      formatReservationTime(reservation).reservation_time.split(':').join('')
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

  // error check, returns an array of errors, or empty array if everything's good
  const formValidation = () => {
    const mobileNumberFormatCheck = mobileNumberFormat();
    const reservationDateTuesdayCheck = getReservationDay();
    const reservMinusTodayDate = reservationMinusTodayDate();
    const reservationTimeIsValidCheck = reservationTimeIsValid();

    const array = [];

    // checks if mobile_number is formatted correctly: XXX-XXX-XXXX
    if (!mobileNumberFormatCheck)
      array.push(
        'The mobile number must be all numbers in format: XXX-XXXX OR XXX-XXX-XXXX'
      );
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

  /* ----- event handlers ----- */
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const runFormValidation = formValidation();

    setFormErrors(runFormValidation);
    if (!runFormValidation.length) {
      try {
        const url = `${API_BASE_URL}/reservations/${reservation.reservation_id}`;
        const data = {
          data: reservation,
        };

        await axios.put(url, data);
        history.push(`/dashboard/?date=${reservation.reservation_date}`);
      } catch (error) {
        console.log(error);
      }
    }
  };

  /* ----- render content ----- */
  return (
    <section className='EditReservation'>
      <h1>Current Reservation Info: </h1>
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
        </div>
      </div>
      {/* Error messages */}
      {formErrors.map((error) => {
        return <ErrorAlert key={error} error={error} />;
      })}
      {/* */}
      <h2>Edit:</h2>
      {reservation.status === 'booked' ? (
        <Form
          formData={reservation}
          setFormData={setReservation}
          handleFormSubmit={handleFormSubmit}
        />
      ) : null}

      <Footer />
    </section>
  );
};

export default EditReservation;
