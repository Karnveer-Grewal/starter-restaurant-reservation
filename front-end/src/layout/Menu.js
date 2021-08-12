// dependencies
import React from 'react';
// local files
import './Menu.css';
import { Link } from 'react-router-dom';

/**
 * Defines the menu for this application.
 *
 * @returns {JSX.Element}
 */

const Menu = () => {
  /* ----- render content ----- */
  return (
    <section className='Menu'>
      <nav>
        <ul>
          <li className='periodic-tables'>
            <Link to='/'>
              <p>Periodic Tables</p>
            </Link>
            <hr className='sidebar-divider my-0' />
          </li>
          <li>
            <Link to='/dashboard'>
              <span className='oi oi-dashboard'></span>
              <p>&nbsp;Dashboard</p>
            </Link>
          </li>
          <li>
            <Link to='/search'>
              <span className='oi oi-magnifying-glass'></span>
              <p>&nbsp;Search</p>
            </Link>
          </li>
          <li>
            <Link to='/reservations/new'>
              <span className='oi oi-plus'></span>
              <p>&nbsp;New Reservation</p>
            </Link>
          </li>
          <li>
            <Link to='/tables/new'>
              <span className='oi oi-layers'></span>
              <p>&nbsp;New Table</p>
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
};

export default Menu;
