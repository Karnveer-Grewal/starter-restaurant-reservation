// dependencies
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
// local files
import Dashboard from '../dashboard/Dashboard';
import NotFound from './NotFound';
import NewReservation from '../reservations/NewReservation';
import ReservationSeat from '../reservations/ReservationSeat';
import NewTable from '../tables/NewTable';
import Search from '../search/Search';
import EditReservation from '../reservations/EditReservation';

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
const Routes = () => {
  return (
    <Switch>
      <Route exact={true} path='/'>
        <Redirect to={'/dashboard'} />
      </Route>
      <Route exact={true} path='/reservations'>
        <Redirect to={'/dashboard'} />
      </Route>
      <Route path='/reservations/new'>
        <NewReservation />
      </Route>
      <Route path={'/reservations/:reservation_id/seat'}>
        <ReservationSeat />
      </Route>
      <Route path={'/reservations/:reservation_id/edit'}>
        <EditReservation />
      </Route>
      <Route exact={true} path='/dashboard/:date'>
        <Dashboard />
      </Route>
      <Route exact={true} path='/dashboard'>
        <Dashboard />
      </Route>
      <Route path={'/tables/new'}>
        <NewTable />
      </Route>
      <Route path='/search'>
        <Search />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Routes;
