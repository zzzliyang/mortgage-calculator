import React from "react";
import {Axis, Chart, Geom, Legend, Tooltip,} from "bizcharts";
import {connect} from "react-redux";
import DataSet from "@antv/data-set";

const mapStateToProps = state => state;

function roundNumber(number) {
    return Math.round(number * 100) / 100;
}

class ResultChart extends React.Component {
    render() {
        const ds = new DataSet();
        const dv = ds.createView().source(this.props.resultState.result);
        const isMultiple = this.props.resultState.resultMultiple;
        let maxScale = Math.max(0, Math.max.apply(null, this.props.resultState.result.map(r => r.totalRepayment)));
        if (isMultiple)
            maxScale = Math.max(maxScale, Math.max.apply(null, this.props.resultState.result.map(r => r.totalRepayment2)));
        const fields = isMultiple ?
            ['interestPayment', 'principalRepayment', 'interestPayment2', 'principalRepayment2'] :
            ['interestPayment', 'principalRepayment'];
        const legends = isMultiple ?
            [
                {value: 'interestPayment', marker: {symbol: 'square', fill: '#2b6cbb'}},
                {value: 'principalRepayment', marker: {symbol: 'square', fill: '#41a2fc'}},
                {value: 'totalRepayment', marker: {symbol: 'square', fill: '#fc0618'}},
                {value: 'interestPayment2', marker: {symbol: 'square', fill: '#067500'}},
                {value: 'principalRepayment2', marker: {symbol: 'square', fill: '#48fc05'}},
                {value: 'totalRepayment2', marker: {symbol: 'square', fill: '#fcd500'}},
            ] :
            [
                {value: 'interestPayment', marker: {symbol: 'square', fill: '#2b6cbb'}},
                {value: 'principalRepayment', marker: {symbol: 'square', fill: '#41a2fc'}},
                {value: 'totalRepayment', marker: {symbol: 'square', fill: '#fc0618'}},
            ];
        maxScale += 200;
        const scale = isMultiple ?
            {
                totalRepayment: {
                    type: 'linear',
                    min: 0,
                    max: maxScale,
                },
                totalRepayment2: {
                    type: 'linear',
                    min: 0,
                    max: maxScale,
                },
                value: {
                    type: 'linear',
                    min: 0,
                    max: maxScale,
                },
            } :
            {
                totalRepayment: {
                    type: 'linear',
                    min: 0,
                    max: maxScale,
                },
                value: {
                    type: 'linear',
                    min: 0,
                    max: maxScale,
                },
            }
        dv.transform({
            type: "fold",
            fields: fields,
            key: 'type',
            value: 'value',
        });
        const totalInterest1 = this.props.resultState.totalInterest1;
        const totalAmount1 = this.props.resultState.totalAmount1;
        const totalPrincipal1 = totalAmount1 - totalInterest1;
        const totalInterest2 = this.props.resultState.totalInterest2;
        const totalAmount2 = this.props.resultState.totalAmount2;
        const totalPrincipal2 = totalAmount2 - totalInterest2;
        return (
            <div>
                <Chart height={400} scale={scale} width={50 * this.props.resultState.result.length} data={dv}>
                    <Legend
                        custom
                        items={legends}
                        position="bottom-left"
                        offsetX={30}
                        itemFormatter={val => {
                            if (val === 'interestPayment')
                                return "Package 1 - Interest Repayment - Total: $" + roundNumber(totalInterest1);
                            if (val === 'principalRepayment')
                                return "Package 1 - Principal Repayment - Total: $" + roundNumber(totalPrincipal1);
                            if (val === 'totalRepayment')
                                return "Package 1 - Total Repayment: $" + roundNumber(totalAmount1);
                            if (val === 'interestPayment2')
                                return "Package 2 - Interest Repayment - Total: $" + roundNumber(totalInterest2);
                            if (val === 'principalRepayment2')
                                return "Package 2 - Principal Repayment - Total: $" + roundNumber(totalPrincipal2);
                            if (val === 'totalRepayment2')
                                return "Package 2 - Total Repayment: $" + roundNumber(totalAmount2);
                        }}
                    />
                    <Axis name="tenor"/>
                    <Axis name="value" position={'left'}/>
                    <Tooltip/>
                    <Geom
                        type="interval"
                        position="tenor*value"
                        color={['type', (value) => {
                            if (value === 'interestPayment') {
                                return '#2b6cbb';
                            }
                            if (value === 'principalRepayment') {
                                return '#41a2fc';
                            }
                            if (value === 'interestPayment2') {
                                return '#067500';
                            }
                            if (value === 'principalRepayment2') {
                                return '#48fc05';
                            }
                        }]}
                        adjust={[{
                            type: 'stack',
                        }]}
                    />
                    <Geom type="line" position="tenor*totalRepayment" color='#fc0618' opacity={0} size={0}/>
                    <Geom type="line" position="tenor*totalRepayment2" color='#fcd500' opacity={0} size={0}/>
                </Chart>
            </div>
        );
    }
}

export default connect(mapStateToProps)(ResultChart);
