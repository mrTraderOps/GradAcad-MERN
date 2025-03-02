import { useState } from "react";
import styles from "../pages/MainPage/fragments/students_panel/styles/StudentsPanel.module.scss";
import SelectCourseSection from "../pages/MainPage/fragments/students_panel/C_S";

interface SwitchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onTermChange: (term: string) => void;
  onGoToGradeSheet: () => void;
  terms: string[];
}

const SwitchPanel = ({
  isVisible,
  onTermChange,
  onGoToGradeSheet,
  terms,
}: SwitchPanelProps) => {
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0]);

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const term = e.target.value;
    setSelectedTerm(term);
    onTermChange(term); // Notify parent of term change
  };

  if (!isVisible) return null;

  return (
    <SelectCourseSection>
      <div className={styles.termSelector}>
        <label htmlFor="term-select">Select Term:</label>
        <select
          id="term-select"
          value={selectedTerm}
          onChange={handleTermChange}
        >
          {terms.map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </select>

        <button onClick={onGoToGradeSheet}>Go to GradeSheet</button>
      </div>
    </SelectCourseSection>
  );
};

export default SwitchPanel;
