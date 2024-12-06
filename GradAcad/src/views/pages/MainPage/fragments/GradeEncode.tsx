import React, { useState } from "react";
import style from "../styles/Department.module.scss";
import Subjects from "./Subjects";
import EncodeGrade from "./students_panel/EncodeGrade";

interface Props {
  LoggeduserName: string;
}

interface SubjectData {
  subjectCode: string;
  subjectName: string;
  course: string;
  section: string;
}

const GradeEncode = ({ LoggeduserName }: Props) => {
  const [activePanel, setActivePanel] = useState("grade_encoding");
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);

  const renderPanel = () => {
    switch (activePanel) {
      case "grade_encoding":
        return (
          <Subjects
            onStudentClick={(data: SubjectData[]) => {
              setSubjectData(data);
              setActivePanel("students");
            }}
            LoggeduserName={LoggeduserName}
          />
        );
      case "students":
        return (
          <EncodeGrade
            data={subjectData}
            onSubjectClick={() => {
              setActivePanel("grade_encoding");
            }}
            LoggeduserName={LoggeduserName}
          />
        );
    }
  };

  return <div className={style.department}>{renderPanel()}</div>;
};

export default GradeEncode;
