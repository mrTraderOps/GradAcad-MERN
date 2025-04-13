import styles from "./styles/AreYouSure.module.scss";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AreYousureLogOut = ({ isOpen, onConfirm, onCancel }: Props) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        style={{ width: "20%", height: "20%", borderRadius: "26px" }}
      >
        <h3>Are you sure you want to log out?</h3>
        <div className={styles.modalActions}>
          <button className={styles.confirm} onClick={onConfirm}>
            Yes
          </button>
          <button
            className={styles.cancel}
            onClick={onCancel}
            style={{
              backgroundColor: "#0F2A71",
              color: "white",
              borderRadius: "5px",
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreYousureLogOut;
