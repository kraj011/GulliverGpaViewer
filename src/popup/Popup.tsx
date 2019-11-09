import * as React from "react";
import "./Popup.scss";
import "antd/dist/antd.css";

import { Table, Tag } from "antd";

import { calculateGpaFromBackground } from "../content";

interface AppProps {}

interface AppState {}

const columns = [
  {
    title: "Class",
    dataIndex: "class",
    key: "class"
  },
  {
    title: "Grade",
    dataIndex: "grade",
    key: "grade"
  }
];

export default class Popup extends React.Component<AppProps, AppState> {
  constructor(props: AppProps, state: AppState) {
    super(props, state);
    this.state = {
      dataSource: [],
      unweightedGpa: 0.0,
      weightedGpa: 0.0
    };
  }

  componentDidMount() {
    // Example of how to send a message to eventPage.ts.
    // chrome.runtime.sendMessage({ popupMounted: true });
    this.initGrades();
    this.pullGpa();
  }

  initGrades() {
    if (localStorage.getItem("currentGrades") !== null) {
      let grades = JSON.parse(localStorage.getItem("currentGrades"));
      const dataSource = [];

      for (let i = 0; i < grades.length; i++) {
        let cGrade = grades[i];
        dataSource.push({
          key: i,
          class: cGrade["name"],
          grade: cGrade["grade"] ? cGrade["grade"] : "N/A"
        });
      }
      console.log(dataSource);

      this.setState({ dataSource: dataSource });
    }
  }

  pullGpa() {
    if (localStorage.getItem("letterGrades") !== null) {
      let grades = JSON.parse(localStorage.getItem("letterGrades"));
      let gpa = calculateGpaFromBackground(grades);
      this.setState({
        unweightedGpa: gpa["unweighted"],
        weightedGpa: gpa["weighted"]
      });
    }
  }

  render() {
    return (
      <div>
        <div className="popupContainer">
          <Table
            dataSource={this.state["dataSource"]}
            columns={columns}
            pagination={false}
          />
        </div>
        <br />
        <br />
        <div className="gpaContainer">
          <Tag color="red">
            Current Unweighted GPA: {this.state["unweightedGpa"]}
          </Tag>
          <Tag color="green">
            Current Weighted GPA: {this.state["weightedGpa"]}
          </Tag>
        </div>
      </div>
    );
  }
}
