import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
  } from "react-router-dom";
import Settings from './Settings';
import Home from './Home';
import Navigation from './Navigation';

export default class App extends React.Component {
    render() {
        return <Router>
            <div className="app">
                <Navigation />
                <Switch>
                    <Route path="/settings">
                        <Settings />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    }
}