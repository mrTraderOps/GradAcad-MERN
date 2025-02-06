import styles from "./styles/AreYouSure.module.scss";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AreYousure = ({ isOpen, onConfirm, onCancel }: Props) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Are you sure you want to save the changes?</h3>
        <div className={styles.modalActions}>
          <button className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirm} onClick={onConfirm}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreYousure;
