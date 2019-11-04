import React, {Component} from 'react';
import {Button, Divider, Form, Input, InputNumber, message, Modal, Row, Select} from 'antd';
import axios from 'axios';
import {connect} from "react-redux";

const {Option} = Select;

const mapStateToProps = state => state;

const median = (values) => {
    if (values.length === 0) return 0;

    values.sort(function (a, b) {
        return a - b;
    });

    const half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];

    return (values[half - 1] + values[half]) / 2.0;
}

const ContactForm = Form.create({name: 'form_in_modal'})(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const {visible, onCancel, onSubmit, form} = this.props;
            const {getFieldDecorator} = form;
            return (
                <Modal
                    visible={visible}
                    title="Get the best mortgage package and free advice from our mortgage experts!"
                    okText="Submit"
                    onCancel={onCancel}
                    onOk={onSubmit}
                >
                    <Form layout="vertical">
                        <Form.Item label="Name">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: 'Please let us know how to address you!'
                                }],
                            })(<Input/>)}
                        </Form.Item>
                        <Form.Item label="Contact Number/Email">
                            {getFieldDecorator('contact', {
                                rules: [{
                                    required: true,
                                    message: 'Please let us know your contact number or email address so that we can reach you!'
                                }],
                            })(<Input/>)}
                        </Form.Item>
                        <Form.Item label="Interest Rate Type" hasFeedback>
                            {getFieldDecorator('rateType', {
                                initialValue: 2,
                                rules: [{required: true, message: 'Please select a interest rate type!'}],
                            })(
                                <Select placeholder="Please choose your preferred package type">
                                    <Option value={0}>Fixed Package</Option>
                                    <Option value={1}>Floating Package</Option>
                                    <Option value={2}>No Preference</Option>
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="Preferred Loan Amount">
                            {getFieldDecorator('loanAmount', {initialValue: 0})(
                                <InputNumber
                                    min={0}
                                    max={100000000}
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    },
);

class Contact extends Component {
    state = {
        visible: false,
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    handleSubmit = () => {
        const {form} = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            const loanAmount = values.loanAmount !== 0 ? values.loanAmount : median(this.props.customerState.loanAmounts);
            const customer = {
                name: values.name,
                contact: values.contact,
                preferredType: values.rateType,
                preferredAmount: loanAmount,
            };

            axios.post(`http://localhost:8088/newcustomer`, customer)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                })
            form.resetFields();
            this.setState({visible: false});
        });
        message.success('Your request has been submitted successfully. We will contact you within 2 business days. Thank you for your interest and patience.', 7);
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    render() {
        return (
            <div>
                <Divider/>
                <Row><Button type="primary" onClick={this.showModal}>
                    Consult Mortgage Experts
                </Button>
                    <ContactForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onSubmit={this.handleSubmit}
                    />
                </Row>
                <Row>Interested to get the best mortgage package in the market? Call us at 88488848 or leave a message
                    to our mortgage expert.</Row>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    null
)(Contact);
