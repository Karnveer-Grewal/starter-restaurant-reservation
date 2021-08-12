// dependencies
import React from 'react';
// local files
import './NotFound.css';
import Footer from './Footer';

/**
 * Defines the "Not Found" page that is displayed for any unmatched route.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
const NotFound = () => {
  return (
    <div className='NotFound'>
      <h1>Not Found</h1>

      <Footer />
    </div>
  );
};

export default NotFound;
