// dependencies
import React from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
// local files
import './Table.css';

const Table = ({ table }) => {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  /* ----- useHistory ----- */
  const history = useHistory();

  /* ----- event handlers ----- */
  const handleFinishButton = async (table_id, reservation_id) => {
    const confirm = window.confirm(
      'Is this table ready to seat new guests? This cannot be undone.'
    );

    // if cancel is clicked, do nothing
    if (!confirm) return;
    try {
      // if ok is clicked, delete reservation_id from the table
      const tableUrl = `${API_BASE_URL}/tables/${table_id}/seat`;
      const reservationUrl = `${API_BASE_URL}/reservations/${reservation_id}/status`;
      const statusData = {
        data: {
          status: 'finished',
        },
      };

      await axios.delete(tableUrl);
      await axios.put(reservationUrl, statusData);
      history.go(0);
    } catch (error) {
      console.log(error);
    }
  };

  /* ----- render content ----- */
  return (
    <div className='Table'>
      <div className='card'>
        <div className='card-body'>
          <h5 className='card-title table-name'>{table.table_name}</h5>
          <p className='card-text table-capacity'>Capacity: {table.capacity}</p>
          {!table.reservation_id ? (
            <p
              className='card-text table-status'
              data-table-id-status={`${table.table_id}`}
            >
              Status: <span className='free'>FREE</span>
            </p>
          ) : (
            <div>
              <p
                className='card-text table-status'
                data-table-id-status={table.table_id}
              >
                Status: <span className='occupied'>OCCUPIED</span>
              </p>
              <div className='buttons'>
                <button
                  className='btn brown-btn buttons'
                  data-table-id-finish={table.table_id}
                  type='button'
                  onClick={() =>
                    handleFinishButton(table.table_id, table.reservation_id)
                  }
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Table;
