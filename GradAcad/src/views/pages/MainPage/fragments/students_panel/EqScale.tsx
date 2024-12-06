import { ReactNode } from "react";
import styles from "./styles/EqScale.module.scss";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const EqScale = ({ isVisible, onClose, children }: Props) => {
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

export default EqScale;
