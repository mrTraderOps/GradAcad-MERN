import { useState } from "react";
import style from "../styles/Department.module.scss";
import Subjects from "./Subjects";
import { SubjectData } from "../../../../models/types/SubjectData";
import GradeSheet from "./students_panel/GradeSheet";
import EncodeGrade from "./students_panel/EncodeGrade";

const GradeEncode = () => {
  const [activePanel, setActivePanel] = useState("subjects");
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);

  const renderPanel = () => {
    switch (activePanel) {
      case "subjects":
        return (
          <Subjects
            onStudentClick={(data: SubjectData[], nextPanel = "students") => {
              setSubjectData(data);
              setActivePanel(nextPanel);
            }}
          />
        );
      case "students":
        return (
          <EncodeGrade
            data={subjectData[0]}
            onSubjectClick={() => {
              setActivePanel("subjects");
            }}
            onStudentClick={(data: SubjectData[], nextPanel = "gradesheet") => {
              setSubjectData(data);
              setActivePanel(nextPanel);
            }}
          />
        );
      case "gradesheet":
        return (
          <GradeSheet
            data={subjectData[0]}
            onSubjectClick={() => {
              setActivePanel("subjects");
            }}
            onStudentClick={(data: SubjectData[], nextPanel = "students") => {
              setSubjectData(data);
              setActivePanel(nextPanel);
            }}
          />
        );
    }
  };

  return <div className={style.department}>{renderPanel()}</div>;
};

export default GradeEncode;
