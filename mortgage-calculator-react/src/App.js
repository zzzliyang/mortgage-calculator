import React, {Component} from 'react';
import ControlForm from './ControlForm';
import './App.css';
import ResultChart from "./ResultChart";
import Contact from "./Contact";
import {Row} from "antd";

class App extends Component {
    render() {
        return (
            <div className="App">
                <Row>
                    <ControlForm/>
                </Row>
                <Row className="result-chart">
                    <ResultChart/>
                </Row>
                <Row>
                    <Contact/>
                </Row>
            </div>
        );
    }
}

export default App;