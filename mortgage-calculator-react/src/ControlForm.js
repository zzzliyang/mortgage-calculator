import React, {Component} from 'react';
import {connect} from "react-redux";
import { setMultiple, setResult} from "./redux/actions";
import {Button, Col, Divider, Form, InputNumber, Radio, Row, Select, Slider} from 'antd';
import './App.css';

const {Option} = Select;

function roundNumber(number, decimal=2) {
    const scale = Math.pow(10, decimal)
    return Math.round(number * scale) / scale;
}

const mapStateToProps = state => state;

const normalScale = 0.0001;

const volatileScale = 0.0005;

const stressedScale = 0.001;

const getScale = int => {
    switch(int) {
        case 1:
            return normalScale;
        case 2:
            return volatileScale;
        case 3:
            return stressedScale;
        default:
            return normalScale;
    }
}

class ControlForm extends Component {

    state = {
        fixedRate: 2,
        fixedRate2: 2,
        isFixed: true,
        isFixed2: true,
        simulation: 1,
        simulation2: 1,
        floatingPkg: 1,
        floatingPkg2: 1,
        scale: 1,
        scale2: 1,
        isMultiple: false,
    };

    monteCarlo = (rate, times, randomScale) => {
        let sum = 0;
        for (let i = 0; i < times; i++) {
            const rand = Math.random();
            sum += rate + randomScale * 2 * (rand - 0.5);
        }
        return Math.max(0.0001, sum / times);
    }

    simulateFloatingRate = (rateType, loanTenure, rate, pkg, simulation, scale) => {
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
                const randomScale = getScale(scale);
                //floating rate
                const rand = Math.random();
                if (simulation === 1)
                    monthInterest = Math.max(0.0001, monthInterest + randomScale * 2 * (rand - 0.5));
                else if (simulation === 2)
                    monthInterest = monthInterest + randomScale * 0.01 * rand;
                else if (simulation === 3)
                    monthInterest = Math.max(0.0001, monthInterest - randomScale * 0.01 * rand);
                else
                    monthInterest = this.monteCarlo(monthInterest, 100, randomScale);
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
            const fixRate = loanInfo.fixedRate;
            const fixRate2 = loanInfo.fixedRate2;
            let outstandingAmount = loanInfo.loanAmount;
            let outstandingAmount2 = loanInfo.loanAmount2;
            const floatingPkg = this.state.floatingPkg;
            const floatingPkg2 = this.state.floatingPkg2;
            const simu = this.state.simulation;
            const simu2 = this.state.simulation2;
            const scale = this.state.scale;
            const scale2 = this.state.scale2;

            const monthlyRatesArray = this.simulateFloatingRate(loanInfo.rateType, loanTenure, fixRate, floatingPkg, simu, scale),
                monthlyRatesArray2 = this.simulateFloatingRate(loanInfo.rateType2, loanTenure2, fixRate2, floatingPkg2, simu2, scale2);

            const result = [];
            let totalInterest1 = 0;
            let totalAmount1 = 0;
            let totalInterest2 = 0;
            let totalAmount2 = 0;
            for (let i = 0; i < loanTenure; i++) {
                const monthlyInterest = monthlyRatesArray[i];
                const year = Math.floor(i / 12), month = i % 12 + 1;
                const tenor1 = '' + year + 'Y' + month + 'M-Package1';
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
                    currentInterest: roundNumber(monthlyInterest * 1200),
                    interestPayment2: null,
                    principalRepayment2: null,
                    totalRepayment2: null,
                    currentInterest2: null,
                });
                if (i < loanTenure2) {
                    const monthlyInterest2 = monthlyRatesArray2[i];
                    const tenor2 = '' + year + 'Y' + month + 'M-Package2';
                    const remainingTenure2 = loanTenure2 - i;
                    const interestPayment2 = outstandingAmount2 * monthlyInterest2;
                    const totalRepayment2 = interestPayment2 / (1 - Math.pow(1 + monthlyInterest2, -1 * remainingTenure2));
                    const principalRepayment2 = totalRepayment2 - interestPayment2;
                    outstandingAmount2 -= principalRepayment2;
                    totalInterest2 += interestPayment2;
                    totalAmount2 += totalRepayment2;
                    result.push({
                        tenor: tenor2,
                        interestPayment2: roundNumber(interestPayment2),
                        principalRepayment2: roundNumber(principalRepayment2),
                        totalRepayment2: roundNumber(totalRepayment2),
                        currentInterest2: roundNumber(monthlyInterest2 * 1200),
                        interestPayment: null,
                        principalRepayment: null,
                        totalRepayment: null,
                        currentInterest: null,
                    });
                }
            }
            for (let i = loanTenure; i < loanTenure2; i++) {
                const monthlyInterest2 = monthlyRatesArray2[i];
                const year = Math.floor(i / 12), month = i % 12 + 1;
                const tenor2 = '' + year + 'Y' + month + 'M-Package2';
                const remainingTenure2 = loanTenure2 - i;
                const interestPayment2 = outstandingAmount2 * monthlyInterest2;
                const totalRepayment2 = interestPayment2 / (1 - Math.pow(1 + monthlyInterest2, -1 * remainingTenure2));
                const principalRepayment2 = totalRepayment2 - interestPayment2;
                outstandingAmount2 -= principalRepayment2;
                totalInterest2 += interestPayment2;
                totalAmount2 += totalRepayment2;
                result.push({
                    tenor: tenor2,
                    interestPayment2: roundNumber(interestPayment2),
                    principalRepayment2: roundNumber(principalRepayment2),
                    totalRepayment2: roundNumber(totalRepayment2),
                    currentInterest2: roundNumber(monthlyInterest2 * 1200),
                    interestPayment: null,
                    principalRepayment: null,
                    totalRepayment: null,
                    currentInterest: null,
                });
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
            const scale = this.state.scale;

            const monthlyRatesArray = this.simulateFloatingRate(loanInfo.rateType, loanTenure, monthInterest, floatingPkg, simu, scale);

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
                    totalRepayment: roundNumber(totalRepayment),
                    currentInterest: roundNumber(monthInterest * 1200),
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
                const isMultiple = this.state.isMultiple;
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
                this.props.setResult({
                    result: calculation.result,
                    resultMultiple: isMultiple,
                    totalAmount1: calculation.totalAmount1,
                    totalInterest1: calculation.totalInterest1,
                    totalAmount2: calculation.totalAmount2,
                    totalInterest2: calculation.totalInterest2
                });
            }
        });
    };

    onAddPlanButtonClick = e => {
        this.setState({isMultiple: !this.state.isMultiple});
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

    onScaleChange = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            scale: value,
        });
    };

    onScaleChange2 = value => {
        if (isNaN(value)) {
            return;
        }
        this.setState({
            scale2: value,
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };
        const {fixedRate, fixedRate2} = this.state;
        const isMultiple = this.state.isMultiple;
        const plan2Style = isMultiple ? {} : {display: 'none'};
        const addPlanButtonText = isMultiple ? 'Remove Package 2' : 'Add a Package';
        const addPlanButtonIcon = isMultiple ? 'minus' : 'plus';
        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit} className="control-form">
                <Row>
                    <Col span={11} style={{ display: 'block' }}>
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
                                    <Col span={10} offset={0} label="Package" hasFeedback>
                                        <Select placeholder="Floating Rate" defaultValue={1}
                                                onChange={this.onFloatingRateChange}>
                                            <Option value={1}>1M SIBOR(1.80217)+0.25%</Option>
                                            <Option value={2}>3M SIBOR(1.83088)+0.2%</Option>
                                            <Option value={3}>FHR8(0.95)+1.1%</Option>
                                        </Select>
                                    </Col>

                                    <Col span={7} offset={1} label="Simulation" hasFeedback>
                                        <Select placeholder="Simulation" defaultValue={1} onChange={this.onSimulationChange}>
                                            <Option value={1}>Random Walk</Option>
                                            <Option value={2}>Step Up</Option>
                                            <Option value={3}>Step Down</Option>
                                            <Option value={4}>Monte Carlo</Option>
                                        </Select>
                                    </Col>

                                    <Col span={5} offset={1} label="Scale" hasFeedback>
                                        <Select placeholder="Scale" defaultValue={1} onChange={this.onScaleChange}>
                                            <Option value={1}>Normal</Option>
                                            <Option value={2}>Volatile</Option>
                                            <Option value={3}>Stressed</Option>
                                        </Select>
                                    </Col>
                                </Row>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={11} offset={1} style={{ display: 'block' }}>
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
                                            value={typeof fixedRate2 === 'number' ? fixedRate2 : 0}
                                            step={0.01}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            min={0}
                                            max={6}
                                            style={{marginLeft: 0}}
                                            step={0.01}
                                            value={fixedRate2}
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
                                    <Col span={10} offset={0} label="Package2" hasFeedback>
                                        <Select placeholder="Floating Rate 2" defaultValue={1}
                                                onChange={this.onFloatingRateChange2}>
                                            <Option value={1}>1M SIBOR(1.80217)+0.25%</Option>
                                            <Option value={2}>3M SIBOR(1.83088)+0.2%</Option>
                                            <Option value={3}>FHR8(0.95)+1.1%</Option>
                                        </Select>
                                    </Col>
                                    <Col span={7} offset={1} label="Simulation2" hasFeedback>
                                        <Select placeholder="Simulation2" defaultValue={1} onChange={this.onSimulationChange2}>
                                            <Option value={1}>Random Walk</Option>
                                            <Option value={2}>Step Up</Option>
                                            <Option value={3}>Step Down</Option>
                                            <Option value={4}>Monte Carlo</Option>
                                        </Select>
                                    </Col>
                                    <Col span={5} offset={1} label="Scale2" hasFeedback>
                                        <Select placeholder="Scale2" defaultValue={1} onChange={this.onScaleChange2}>
                                            <Option value={1}>Normal</Option>
                                            <Option value={2}>Volatile</Option>
                                            <Option value={3}>Stressed</Option>
                                        </Select>
                                    </Col>
                                </Row>,
                            )}
                        </Form.Item>

                    </Col>
                </Row>


                <Form.Item wrapperCol={{span: 12, offset: 6}} className="control-form-buttons">
                    <Button className="add-button" type="primary" icon={addPlanButtonIcon} onClick={this.onAddPlanButtonClick}>
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
    {setResult, setMultiple}
)(wrappedForm);