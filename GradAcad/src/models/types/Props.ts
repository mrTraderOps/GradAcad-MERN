import { ReactNode } from "react";
import { SubjectData } from "./SubjectData";

export interface Props {
    LoggedName?: string;
    LoggeduserName?: string;
    onSubjectClick?: () => void;
    isVisible?: boolean;
    onClose?: () => void;
    children?: ReactNode;
    onCourseClick?: () => void;
    onDepartmentClick?: () => void;
    data?: any;
    onStudentClick?: (data: SubjectData[], nextPanel: string) => void
  }
  