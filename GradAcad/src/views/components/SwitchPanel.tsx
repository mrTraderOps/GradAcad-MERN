import { useState } from "react";
import styles from "../pages/MainPage/fragments/students_panel/styles/StudentsPanel.module.scss";
import SelectCourseSection from "../pages/MainPage/fragments/students_panel/C_S";
import { useTerm } from "../../hooks/useTerm"; // Import the useTerm hook

interface SwitchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onTermChange: (term: string) => void;
  onGoToGradeSheet?: () => void;
  isGradeSheet?: boolean;
  isChangeTitle?: string;
  currentTerm?: string;
}

const SwitchPanel = ({
  isVisible,
  onClose,
  onTermChange,
  onGoToGradeSheet,
  isGradeSheet = false,
  isChangeTitle = "Select Term",
  currentTerm, // New prop for the currently selected term
}: SwitchPanelProps) => {
  const { terms, error, loading } = useTerm();
  const [selectedTerm, setSelectedTerm] = useState<string>("PRELIM");

  if (!isVisible) return null;

  // Filter out the currentTerm from the list of terms
  const filteredTerms = terms.map((termData) => {
    if (termData.term && termData.term.length > 0) {
      const filteredTermEntries = Object.entries(termData.term[0]).filter(
        ([termKey]) => termKey.toUpperCase() !== currentTerm?.toUpperCase()
      );
      return {
        ...termData,
        term: [Object.fromEntries(filteredTermEntries)],
      };
    }
    return termData;
  });

  return (
    <SelectCourseSection isVisible={isVisible} onClose={onClose}>
      <div className={styles.termSelector}>
        <label>{isChangeTitle}</label>
        <div className={styles.termButtons}>
          {loading ? (
            <p>Loading terms...</p>
          ) : error ? (
            <p className={styles.error}>Error loading terms</p>
          ) : filteredTerms.length > 0 ? (
            filteredTerms.map((termData, index) =>
              termData.term && termData.term.length > 0
                ? Object.entries(termData.term[0]).map(([termKey, termValue]) =>
                    termValue ? (
                      <button
                        key={`${index}-${termKey}`}
                        className={`${styles.termButton} ${
                          selectedTerm === termKey.toUpperCase()
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedTerm(termKey.toUpperCase());
                          onTermChange(termKey.toUpperCase());
                          onClose();
                        }}
                      >
                        {termKey.toUpperCase()}
                      </button>
                    ) : null
                  )
                : null
            )
          ) : (
            <p>No terms available</p>
          )}
        </div>
        {!isGradeSheet && (
          <button onClick={onGoToGradeSheet}>Go to GradeSheet</button>
        )}
      </div>
    </SelectCourseSection>
  );
};

export default SwitchPanel;
