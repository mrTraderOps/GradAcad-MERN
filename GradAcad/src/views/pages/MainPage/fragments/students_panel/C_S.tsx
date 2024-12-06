import { ReactNode } from "react";
import styles from "./styles/C_S.module.scss"; // Style file for the popup

interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const SelectCourseSection = ({ isVisible, onClose, children }: Props) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default SelectCourseSection;
