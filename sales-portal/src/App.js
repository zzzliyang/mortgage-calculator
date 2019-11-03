import React from 'react';
import {Button, Table, Popconfirm, Tag} from 'antd';
import axios from 'axios';
import './App.css';
import './table.css';

const data = [
    {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
    },
    {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
    },
    {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
    },
    {
        key: '4',
        name: 'Jim Red',
        age: 32,
        address: 'London No. 2 Lake Park',
    },
];

class App extends React.Component {

    state = {
        data: []
    };

    componentDidMount() {
        this.onRefresh();
    }

    onRefresh = () => {
        axios.get(`http://localhost:8088/customerdata`)
            .then(res => {
                console.log(res);
                this.setState({data: res.data})
            })
    };

    handleDelete = key => {
        axios.post(`http://localhost:8088/deletecustomer`, { id: key })
            .then(res => {
                console.log(res);
                console.log(res.data);
                this.onRefresh();
            })
    };

    handleFlag = key => {
        axios.post(`http://localhost:8088/flagcustomer`, { id: key })
            .then(res => {
                console.log(res);
                console.log(res.data);
                this.onRefresh();
            })
    };

    render() {
        let {data} = this.state;
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Contact',
                dataIndex: 'contact',
                key: 'contact',
            },
            {
                title: 'Preferred Package Type',
                dataIndex: 'preferredType',
                key: 'preferredType',
            },
            {
                title: 'Preferred Loan Amount',
                dataIndex: 'preferredAmount',
                key: 'preferredAmount',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: status => {
                    let color = 'grey';
                    if (status === 'IMPORTANT') {
                        color = 'volcano';
                    } else if (status === 'PENDING') {
                        color = 'green';
                    }
                    return (
                        <span>
                            <Tag color={color} key={status}>
                                {status}
                            </Tag>
                        </span>
                    );
                }
            },
            {
                title: 'Created Time',
                dataIndex: 'createdTime',
                key: 'createdTime',
            },
            {
                title: 'Operations',
                width: '8%',
                dataIndex: 'operation',
                render: (text, record) =>
                    data.length >= 1 ? (
                        <Popconfirm title="Sure to flag?" onConfirm={() => this.handleFlag(record.id)}>
                            <a>Flag as Important</a>
                        </Popconfirm>
                    ) : null,
            },
            {
                title: '',
                width: '8%',
                dataIndex: 'operation',
                render: (text, record) =>
                    data.length >= 1 ? (
                        <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
                            <a className="delete-button">Delete</a>
                        </Popconfirm>
                    ) : null,
            },
        ];
        return (
            <div>
                <div className="table-operations">
                    <Button onClick={this.onRefresh} type="primary" icon="reload">Refresh</Button>
                </div>
                <Table columns={columns} dataSource={data} onChange={this.handleChange}/>
            </div>
        );
    }
    }

    export
    default
    App;