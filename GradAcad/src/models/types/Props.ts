import { ReactNode } from "react";

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
  }
  