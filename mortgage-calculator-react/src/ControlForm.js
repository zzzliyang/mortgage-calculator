import React, {Component} from 'react';
import {connect} from "react-redux";
import { setMultiple, setResult, setTotal1, setTotal2 } from "./redux/actions";
import {Button, Col, Divider, Form, InputNumber, Radio, Row, Select, Slider} from 'antd';
import './App.css';

const {Option} = Select;

function roundNumber(number) {
    return Math.round(number * 100) / 100;
}

const mapStateToProps = state => state;

const randomScale = 0.0001;

class ControlForm extends Component {

    state = {
        fixedRate: 2,
        fixedRate2: 2,
        isFixed: true,
        isFixed2: true,
        simulation: 1,
        simulation2: 1,
        floatingPkg: 1,
        floatingPkg2: 1
    };

    monteCarlo = (rate, times) => {
        const rates = [];
        for (let i = 0; i < times; i++) {
            const rand = Math.random();
            rates.push(rate + randomScale * 2 * (rand - 0.5))
        }
    }

    simulateFloatingRate = (rateType, loanTenure, rate, pkg, simulation) => {
        /* Packages
        <Option value={1}>1M SIBOR(1.80217)+0.25%</Option>
        <Option value={2}>3M SIBOR(1.83088)+0.2%</Option>
        <Option value={3}>FHR8(0.95)+1.1%</Option>*/
        /* Simulations
        <Option value={1}>Random Walk</Option>
        <Option value={2}>Step Up</Option>
        <Option value={3}>Step Down</Option>
        <Option value={4}>Monte Carlo</Option>*/
        let monthInterest = rate;//loanInfo.fixedRate;
        const monthlyRates = [];
        if (pkg === 1)
            monthInterest = (1.80217 + 0.25) / 1200;
        else if (pkg === 2)
            monthInterest = (1.83088 + 0.2) / 1200;
        else if (pkg === 3)
            monthInterest = (0.95 + 1.1) / 1200;
        for (let i = 0; i < loanTenure; i++) {
            if (rateType === 2) {
                //floating rate
                const rand = Math.random();
                if (simulation === 1)
                    monthInterest = monthInterest + randomScale * 2 * (rand - 0.5);
                else if (simulation === 2)
                    monthInterest = monthInterest + randomScale * 0.01 * rand;
                else if (simulation === 3)
                    monthInterest = Math.max(0.0001, monthInterest - randomScale * 0.01 * rand);
                else
                    monthInterest = this.monteCarlo(monthInterest, 100);
                monthlyRates.push(monthInterest);
            } else {//fixed rate
                monthlyRates.push(monthInterest);
            }
        }
        return monthlyRates;
    };

    calculate = loanInfo => {
        if (loanInfo.isMultiple) {
            const loanTenure = loanInfo.loanTenure;
            const loanTenure2 = loanInfo.loanTenure2;
            const monthlyInterest = loanInfo.fixedRate;
            const monthlyInterest2 = loanInfo.fixedRate2;
            let outstandingAmount = loanInfo.loanAmount;
            let outstandingAmount2 = loanInfo.loanAmount2;
            const floatingPkg = this.state.floatingPkg;
            const floatingPkg2 = this.state.floatingPkg2;
            const simu = this.state.simulation;
            const simu2 = this.state.simulation2;

            const monthlyRatesArray = this.simulateFloatingRate(loanInfo.rateType, loanTenure, monthlyInterest, floatingPkg, simu),
                monthlyRatesArray2 = this.simulateFloatingRate(loanInfo.rateType2, loanTenure2, monthlyInterest2, floatingPkg2, simu2);

            const result = [];
            let totalInterest1 = 0;
            let totalAmount1 = 0;
            let totalInterest2 = 0;
            let totalAmount2 = 0;
            const moreTenure1 = loanTenure >= loanTenure2;
            let minTenure = loanTenure;
            if (moreTenure1)
                minTenure = loanTenure2
            for (let i = 0; i < minTenure; i++) {
                const monthlyInterest = monthlyRatesArray[i], monthlyInterest2 = monthlyRatesArray2[i];
                const year = Math.floor(i / 12), month = i % 12 + 1;
                const tenor1 = '' + year + 'Y' + month + 'M' + 'Package1';
                const interestPayment = outstandingAmount * monthlyInterest;
                const remainingTenure = loanTenure - i;
                const totalRepayment = interestPayment / (1 - Math.pow(1 + monthlyInterest, -1 * remainingTenure));
                const principalRepayment = totalRepayment - interestPayment;
                outstandingAmount -= principalRepayment;
                totalInterest1 += interestPayment;
                totalAmount1 += totalRepayment;
                result.push({
                    tenor: tenor1,
                    interestPayment: roundNumber(interestPayment),
                    principalRepayment: roundNumber(principalRepayment),
                    totalRepayment: roundNumber(totalRepayment),
                    interestPayment2: null,
                    principalRepayment2: null,
                    totalRepayment2: null,
                });
                const tenor2 = '' + year + 'Y' + month + 'M' + 'Package2';
                const remainingTenure2 = loanTenure2 - i;
                const interestPayment2 = outstandingAmount2 * monthlyInterest2;
                const totalRepayment2 = interestPayment2 / (1 - Math.pow(1 + monthlyInterest2, -1 * remainingTenure2));
                const principalRepayment2 = totalRepayment2 - interestPayment2;
                outstandingAmount2 -= principalRepayment2;
                totalInterest2 += principalRepayment2;
                totalAmount2 += totalRepayment2;
                result.push({
                    tenor: tenor2,
                    interestPayment2: roundNumber(interestPayment2),
                    principalRepayment2: roundNumber(principalRepayment2),
                    totalRepayment2: roundNumber(totalRepayment2),
                    interestPayment: null,
                    principalRepayment: null,
                    totalRepayment: null,
                });
            }
            if (moreTenure1) {
                for (let i = minTenure; i < loanTenure; i++) {
                    const monthInterest = monthlyRatesArray[i];
                    const year = Math.floor(i / 12), month = i % 12 + 1;
                    const tenor = '' + year + 'Y' + month + "M";
                    const interestPayment = outstandingAmount * monthInterest;
                    const remainingTenure = loanTenure - i;
                    const totalRepayment = interestPayment / (1 - Math.pow(1 + monthInterest, -1 * remainingTenure));
                    const principalRepayment = totalRepayment - interestPayment;
                    outstandingAmount -= principalRepayment;
                    totalInterest1 += interestPayment;
                    totalAmount1 += totalRepayment;
                    result.push({
                        tenor: tenor,
                        interestPayment: roundNumber(interestPayment),
                        principalRepayment: roundNumber(principalRepayment),
                        totalRepayment: roundNumber(totalRepayment),
                        interestPayment2: null,
                        principalRepayment2: null,
                        totalRepayment2: null,
                    });
                }
            } else {
                for (let i = minTenure; i < loanTenure2; i++) {
                    const monthInterest2 = monthlyRatesArray[i];
                    const year = Math.floor(i / 12), month = i % 12 + 1;
                    const tenor2 = '' + year + 'Y' + month + 'M' + 'Package2';
                    const remainingTenure2 = loanTenure2 - i;
                    const interestPayment2 = outstandingAmount2 * monthlyInterest2;
                    const totalRepayment2 = interestPayment2 / (1 - Math.pow(1 + monthlyInterest2, -1 * remainingTenure2));
                    const principalRepayment2 = totalRepayment2 - interestPayment2;
                    outstandingAmount2 -= principalRepayment2;
                    totalInterest2 += principalRepayment2;
                    totalAmount2 += totalRepayment2;
                    result.push({
                        tenor: tenor2,
                        interestPayment2: roundNumber(interestPayment2),
                        principalRepayment2: roundNumber(principalRepayment2),
                        totalRepayment2: roundNumber(totalRepayment2),
                        interestPayment: null,
                        principalRepayment: null,
                        totalRepayment: null,
                    });
                }
            }
            return {
                result: result,
                totalInterest1: totalInterest1,
                totalAmount1: totalAmount1,
                totalInterest2: totalInterest2,
                totalAmount2: totalAmount2,
            };
        } else {
            const loanTenure = loanInfo.loanTenure;
            const monthInterest = loanInfo.fixedRate;
            let outstandingAmount = loanInfo.loanAmount;
            const floatingPkg = this.state.floatingPkg;
            const simu = this.state.simulation;

            const monthlyRatesArray = this.simulateFloatingRate(loanInfo.rateType, loanTenure, monthInterest, floatingPkg, simu);

            const result = [];
            let totalInterest = 0;
            let totalAmount = 0;
            //const interestData = {name: "Interest"}, principalData = {name: "Principal"};
            for (let i = 0; i < loanTenure; i++) {
                const monthInterest = monthlyRatesArray[i];
                const year = Math.floor(i / 12), month = i % 12 + 1;
                const tenor = '' + year + 'Y' + month + "M";
                const interestPayment = outstandingAmount * monthInterest;
                const remainingTenure = loanTenure - i;
                const totalRepayment = interestPayment / (1 - Math.pow(1 + monthInterest, -1 * remainingTenure));
                const principalRepayment = totalRepayment - interestPayment;
                outstandingAmount -= principalRepayment;
                totalInterest += interestPayment;
                totalAmount += totalRepayment;
                result.push({
                    tenor: tenor,
                    interestPayment: roundNumber(interestPayment),
                    principalRepayment: roundNumber(principalRepayment),
                    totalRepayment: roundNumber(totalRepayment)
                });
            }
            return {
                result: result,
                totalInterest1: totalInterest,
                totalAmount1: totalAmount,
            };
        }
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                // console.log('Data', principalData);console.log('Int', interestData);
                const fixedRate = this.state.fixedRate / 1200;
                const loanTenure = values.loanTenure * 12;
                const loanAmount = values.loanAmount;
                const loanAmounts = this.props.customerState.loanAmounts;
                loanAmounts.push(loanAmount);
                const isMultiple = this.props.resultState.isMultiple;
                const rateType = values.rateType; //1=fixed, 2=float
                const loanInfo = {
                    loanTenure: loanTenure,
                    fixedRate: fixedRate,
                    loanAmount: loanAmount,
                    rateType: rateType,
                    isMultiple: isMultiple
                };
                const fixedRate2 = this.state.fixedRate2 / 1200;
                const loanTenure2 = values.loanTenure2 * 12;
                const loanAmount2 = values.loanAmount2;
                const rateType2 = values.rateType2; //1=fixed, 2=float
                if (isMultiple) {
                    loanAmounts.push(loanAmount2);
                    loanInfo['loanAmount2'] = loanAmount2;
                    loanInfo['fixedRate2'] = fixedRate2;
                    loanInfo['loanTenure2'] = loanTenure2;
                    loanInfo['rateType2'] = rateType2;
                }
                const calculation = this.calculate(loanInfo);
                console.log(this.props);
                this.props.setResult(calculation.result);
                this.props.setTotal1({
                    totalAmount1: calculation.totalAmount1,
                    totalInterest1: calculation.totalInterest1
                });
                if (calculation.totalAmount2) {
                    this.props.setTotal2({
                        totalAmount2: calculation.totalAmount2,
                        totalInterest2: calculation.totalInterest2
                    })
                }
            }
        });
    };

    onAddPlanButtonClick = e => {
        this.props.setMultiple(!this.props.resultState.isMultiple);
    };

    onRateTypeChange = e => {
        this.setState({isFixed: !this.state.isFixed});
    };

    onRateTypeChange2 = e => {
        this.setState({isFixed2: !this.state.isFixed2});
    };

    onFixedRateChange = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            fixedRate: value,
        });
    };

    onFixedRateChange2 = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            fixedRate2: value,
        });
    };

    onFloatingRateChange = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            floatingPkg: value,
        });
    };

    onFloatingRateChange2 = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            floatingPkg2: value,
        });
    };

    onSimulationChange = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            simulation: value,
        });
    };

    onSimulationChange2 = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            simulation2: value,
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };
        const {fixedRate, fixedRate2} = this.state;
        const isMultiple = this.props.resultState.isMultiple;
        const plan2Style = isMultiple ? {} : {display: 'none'};
        const addPlanButtonText = isMultiple ? 'Remove this package' : 'Add a package';
        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit} className="control-form">
                <Divider>Package 1</Divider>

                <Form.Item label="Loan Amount">
                    {getFieldDecorator('loanAmount', {
                        initialValue: 700000,
                        rules: [{required: true, message: 'Please select a interest rate type!'}],
                    })(
                        <InputNumber
                            style={{width: '100%'}}
                            min={1}
                            max={100000000}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
                    )}
                </Form.Item>

                <Form.Item label="Interest Rate Type">
                    {getFieldDecorator('rateType', {initialValue: 1})(
                        <Radio.Group name="radiogroup" onChange={this.onRateTypeChange}>
                            <Radio value={1}>Fixed Rate</Radio>
                            <Radio value={2}>Floating Rate</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>

                <Form.Item label="Loan tenure(in years)">
                    {getFieldDecorator('loanTenure', {
                        initialValue: 30
                    })(
                        <Slider
                            max={50}
                            marks={{
                                10: '10',
                                20: '20',
                                30: '30',
                                40: '40',
                                50: '50'
                            }}
                        />
                    )}
                </Form.Item>

                <Form.Item style={this.state.isFixed ? {} : {display: 'none'}} label="Annual Interest Rate(%)">
                    {getFieldDecorator('fixedRate')(
                        <Row>
                            <Col span={20}>
                                <Slider
                                    min={0}
                                    max={6}
                                    marks={{
                                        1: '1',
                                        1.5: '1.5',
                                        2: '2',
                                        2.5: '2.5',
                                        3: '3',
                                        5: '5',
                                    }}
                                    onChange={this.onFixedRateChange}
                                    value={typeof fixedRate === 'number' ? fixedRate : 0}
                                    step={0.01}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={0}
                                    max={6}
                                    style={{marginLeft: 0}}
                                    step={0.01}
                                    value={fixedRate}
                                    onChange={this.onFixedRateChange}
                                />
                            </Col>
                        </Row>
                    )}
                </Form.Item>

                <Form.Item style={this.state.isFixed ? {display: 'none'} : {height: '54px'}} label="Floating Interest Rate(%)">
                    {getFieldDecorator('floatingRate')(
                        <Row>
                            <Col span={10} offset={2} label="Package" hasFeedback>
                                <Select placeholder="Floating Rate" defaultValue={1}
                                        onChange={this.onFloatingRateChange}>
                                    <Option value={1}>1M SIBOR(1.80217)+0.25%</Option>
                                    <Option value={2}>3M SIBOR(1.83088)+0.2%</Option>
                                    <Option value={3}>FHR8(0.95)+1.1%</Option>
                                </Select>
                            </Col>

                            <Col span={8} offset={4} label="Simulation" hasFeedback>
                                <Select placeholder="Simulation" defaultValue={1} onChange={this.onSimulationChange}>
                                    <Option value={1}>Random Walk</Option>
                                    <Option value={2}>Step Up</Option>
                                    <Option value={3}>Step Down</Option>
                                    <Option value={4}>Monte Carlo</Option>
                                </Select>
                            </Col>
                        </Row>
                    )}
                </Form.Item>

                <Divider style={plan2Style}>Package 2</Divider>

                <Form.Item label="Loan Amount 2" style={plan2Style}>
                    {getFieldDecorator('loanAmount2', {
                        initialValue: 700000,
                        rules: [{required: true, message: 'Please select a interest rate type!'}],
                    })(
                        <InputNumber
                            style={{width: '100%'}}
                            min={1}
                            max={100000000}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
                    )}
                </Form.Item>

                <Form.Item label="Interest Rate Type 2" style={plan2Style}>
                    {getFieldDecorator('rateType2', {initialValue: 1})(
                        <Radio.Group name="radiogroup" onChange={this.onRateTypeChange2}>
                            <Radio value={1}>Fixed Rate</Radio>
                            <Radio value={2}>Floating Rate</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>

                <Form.Item label="Loan tenure(in years) 2" style={plan2Style}>
                    {getFieldDecorator('loanTenure2', {
                        initialValue: 30
                    })(
                        <Slider
                            max={50}
                            marks={{
                                10: '10',
                                20: '20',
                                30: '30',
                                40: '40',
                                50: '50'
                            }}
                        />
                    )}
                </Form.Item>

                <Form.Item style={this.state.isFixed2 && isMultiple ? {} : {display: 'none'}}
                           label="Annual Interest Rate(%) 2">
                    {getFieldDecorator('fixedRate2')(
                        <Row>
                            <Col span={20}>
                                <Slider
                                    min={0}
                                    max={6}
                                    marks={{
                                        1: '1',
                                        1.5: '1.5',
                                        2: '2',
                                        2.5: '2.5',
                                        3: '3',
                                        5: '5',
                                    }}
                                    onChange={this.onFixedRateChange}
                                    value={typeof fixedRate === 'number' ? fixedRate : 0}
                                    step={0.01}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={0}
                                    max={6}
                                    style={{marginLeft: 0}}
                                    step={0.01}
                                    value={fixedRate}
                                    onChange={this.onFixedRateChange}
                                />
                            </Col>
                        </Row>,
                    )}
                </Form.Item>

                <Form.Item style={isMultiple ? this.state.isFixed2 ? {display: 'none'} : {height: '54px'} : {display: 'none'}}
                           label="Floating Interest Rate(%) 2">
                    {getFieldDecorator('floatingRate2')(
                        <Row>
                            <Col span={10} offset={2} label="Package" hasFeedback>
                                <Select placeholder="Floating Rate" defaultValue={1}
                                        onChange={this.onFloatingRateChange2}>
                                    <Option value={1}>1M SIBOR(1.80217)+0.25%</Option>
                                    <Option value={2}>3M SIBOR(1.83088)+0.2%</Option>
                                    <Option value={3}>FHR8(0.95)+1.1%</Option>
                                </Select>
                            </Col>
                            <Col span={8} offset={4} label="Simulation" hasFeedback>
                                <Select placeholder="Simulation" defaultValue={1} onChange={this.onSimulationChange2}>
                                    <Option value={1}>Random Walk</Option>
                                    <Option value={2}>Step Up</Option>
                                    <Option value={3}>Step Down</Option>
                                    <Option value={4}>Monte Carlo</Option>
                                </Select>
                            </Col>
                        </Row>,
                    )}
                </Form.Item>

                <Form.Item wrapperCol={{span: 12, offset: 6}} className="control-form-buttons">
                    <Button className="add-button" type="primary" icon="plus" onClick={this.onAddPlanButtonClick}>
                        {addPlanButtonText}
                    </Button>
                    <Button className="calc-button" type="primary" icon="calculator" htmlType="submit">
                        Calculate
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

const monthlyData = {};
for (let i = 0; i < 120; i++) {
    const year = Math.floor(i / 12), month = i % 12 + 1;
    const tenor = '' + year + 'Y' + month + "M";
    const prin = Math.round(5000 - 1000 / (i + 1)), int = Math.round(5000 - prin);
    monthlyData[tenor] = {"Tenor": tenor, "Interest": int, "Principal": prin, "Total": 5000};
}

const wrappedForm = Form.create({name: 'validate_other'})(ControlForm);

export default connect(
    mapStateToProps,
    {setResult, setMultiple, setTotal1, setTotal2}
)(wrappedForm);