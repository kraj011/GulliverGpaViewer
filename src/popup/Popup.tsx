import * as React from "react";
import "./Popup.scss";
import "antd/dist/antd.css";

import { Table } from "antd";

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
      dataSource: []
    };
  }

  componentDidMount() {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({ popupMounted: true });
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

  render() {
    return (
      <div className="popupContainer">
        <Table
          dataSource={this.state["dataSource"]}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}
