import React from 'react';
import Menu from './Menu';
import Routes from './Routes';

import './Layout.css';

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
const Layout = () => {
  return (
    <main className='Layout'>
      <Menu />
      <Routes />
    </main>
  );
};

export default Layout;
