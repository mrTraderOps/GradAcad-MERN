import { useState } from "react";
import style from "../styles/Department.module.scss";
import Subjects from "./Subjects";
import EncodeGrade from "./students_panel/EncodeGrade";
import { Props } from "../../../../models/types/Props";
import { SubjectData } from "../../../../models/types/SubjectData";

const GradeEncode = ({ LoggeduserName }: Props) => {
  const [activePanel, setActivePanel] = useState("grade_encoding");
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);

  const renderPanel = () => {
    switch (activePanel) {
      case "grade_encoding":
        return (
          <Subjects
            LoggeduserName={LoggeduserName}
            onStudentClick={(data: SubjectData[]) => {
              setSubjectData(data);
              setActivePanel("students");
            }}
          />
        );
      case "students":
        return (
          <EncodeGrade
            data={subjectData[0]}
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
