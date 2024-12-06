import course_styles from "../styles/Courses.module.scss";
import style from "../styles/Department.module.scss";

interface Props {
  onCourseClick: () => void;
  onDepartmentClick: () => void;
}

const Courses = ({ onCourseClick, onDepartmentClick }: Props) => {
  return (
    <main className={course_styles.mainCourses}>
      <header>
        <button onClick={onDepartmentClick}>
          <img src="src\assets\icons\backButton.png" alt="Back" width={35} />
        </button>
        <h2>COLLEGE OF COMPUTING STUDIES</h2>
      </header>
      <div>
        <ul>
          <li>
            <button onClick={onCourseClick}>
              <div>
                <div className={style.triangle1}></div>
                <div className={style.deptName}>
                  <h2>BSCS</h2>
                  <p>Bachelor of Science In Computer Science</p>
                </div>
              </div>
            </button>
          </li>
          <li>
            <button>
              <div>
                <div className={style.triangle2}></div>
                <div className={style.deptName}>
                  <h2>ACT</h2>
                  <p>Associate in Computing Studies</p>
                </div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default Courses;
