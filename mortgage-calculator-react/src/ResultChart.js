import React from "react";
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Legend,
} from "bizcharts";
import { connect } from "react-redux";
import DataSet from "@antv/data-set";
import {Row} from "antd";

const mapStateToProps = state => state;

const scale = {
    totalRepayment: {
        type: 'linear',
        min: 0,
    },
    value: {
        type: 'linear',
        min: 0,
    },
};

class ResultChart extends React.Component {
    render() {
        const ds = new DataSet();
        const dv = ds.createView().source(this.props.resultState.result);
        dv.transform({
            type: "fold",
            fields: ['interestPayment', 'principalRepayment', 'interestPayment2', 'principalRepayment2'],
            key: 'type',
            value: 'value',
        });
        return (
            <div>
                <Chart height={400} scale={scale} width={50*this.props.resultState.result.length} data={dv}>
                    <Legend />
                    <Axis name="tenor" />
                    <Axis name="value" position={'left'} />
                    <Tooltip />
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
                    <Geom type="line" position="tenor*totalRepayment" color='red' opacity={0} size={3} />
                </Chart>
            </div>
        );
    }
}

export default connect(mapStateToProps)(ResultChart);
