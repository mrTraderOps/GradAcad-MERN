import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../../context/UserContext";
import styles from "../../styles/MainPage.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useTerm } from "../../../../../hooks/useTerm";
import { GradeData } from "../../../../../models/types/GradeData";
import { useSubjectsV2 } from "../../../../../hooks/useSubjects";
import API from "../../../../../context/axiosInstance";
import arrow from "../../../../../assets/icons/right-arrow.png";

interface Grade {
  subject: string;
  avgGrade: number;
  modeGrade: number;
}

interface Props {
  setIsPageOne: () => void;
}

const GradeDistribution = ({ setIsPageOne }: Props) => {
  const context = useContext(UserContext);

  const { user }: any = context;

  if (!context) {
    throw new Error("User role can't read");
  }

  const { initialAcadYr, initialSem } = useTerm();

  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialAcadYr);
  const [selectedSem, setSelectedSem] = useState<string>(initialSem);
  const [insight, setInsight] = useState<string>("");
  const [interpret, setInterpret] = useState<string>("");
  const [gradeData, setGradeData] = useState<Grade[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("Loading..");

  const [grades, setGrades] = useState<GradeData[]>([]);

  // 1. Initialization effect
  useEffect(() => {
    // Set initial values from props
    setSelectedAcadYr(initialAcadYr);
    setSelectedSem(initialSem);

    // Mark initialization as complete
    setIsInitialized(true);

    // Cleanup function
    return () => {
      setIsInitialized(false);
    };
  }, [initialAcadYr, initialSem]);

  const { subjects } = useSubjectsV2(user.refId, undefined, undefined, {
    enabled: isInitialized,
  });

  const uniqueAcadYrs = [...new Set(subjects.map((subject) => subject.acadYr))];
  const uniqueSems = [...new Set(subjects.map((subject) => subject.sem))];

  const handleAcadYrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    setSelectedAcadYr(selectedValue);
  };

  const handleSemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    setSelectedSem(selectedValue);
  };

  const gradeColors = ["#8884d8", "#82ca9d"];

  useEffect(() => {
    if (user.role !== "prof") return;

    const fetchGrades = async () => {
      try {
        const response = await API.post("/grade/getStudentGradesV2", {
          refId: user.refId,
          acadYr: selectedAcadYr,
          sem: selectedSem,
        });

        if (response.data.success) {
          const fetchedGrades = response.data.data;
          setGrades(fetchedGrades);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        setErrorMessage("An error occurred while fetching grades.");
      }
    };

    fetchGrades();
  }, [selectedAcadYr, selectedSem, user.role]);

  useEffect(() => {
    const groupBySubject = grades.reduce((acc, curr) => {
      const subject = curr.SubjectId;
      if (subject === undefined) return acc; // Skip if subject is undefined
      if (!acc[subject]) acc[subject] = [];

      // Get average of all available term grades for this student
      const termScores = Object.values(curr.terms).filter(
        (v) => typeof v === "number"
      ) as number[];
      if (termScores.length > 0) {
        const avg = termScores.reduce((a, b) => a + b, 0) / termScores.length;
        acc[subject].push(Math.round(avg)); // Round to nearest whole number for mode clarity
      }

      return acc;
    }, {} as Record<string, number[]>);

    const processedData = Object.entries(groupBySubject).map(
      ([subject, gradeList]) => {
        // Calculate average
        const avgGrade = Number(
          (gradeList.reduce((a, b) => a + b, 0) / gradeList.length).toFixed(1)
        );

        // Calculate mode
        const freqMap: Record<number, number> = {};
        gradeList.forEach((grade) => {
          freqMap[grade] = (freqMap[grade] || 0) + 1;
        });

        const modeGrade = parseInt(
          Object.entries(freqMap).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
        );

        return {
          subject,
          avgGrade,
          modeGrade,
        };
      }
    );

    setGradeData(processedData);

    // Call the bot API once gradeData is ready
    const fetchBotResponse = async () => {
      try {
        const botResponse = await API.post("/bot/barChatBot", {
          gradeData: processedData,
        });

        if (botResponse.data.success) {
          setInterpret(botResponse.data.interpret);
          setInsight(botResponse.data.insight);
          setErrorMessage("");
        } else {
          setErrorMessage("Failed to give interpretation and insight.");
        }
      } catch (error) {
        console.error("Error fetching bot response:", error);
        setErrorMessage(
          "An error occurred while fetching interpretation and insight."
        );
      }
    };

    fetchBotResponse();
  }, [grades]);

  return (
    <div>
      <div>
        <p>GRADE DISTRIBUTION PER SUBJECT</p>
        <div className={styles.selectCont}>
          <p>A.Y:</p>
          <select
            className={styles.sortSelect}
            value={selectedAcadYr}
            onChange={handleAcadYrChange}
          >
            {uniqueAcadYrs.map((acadYr, index) => (
              <option key={index} value={acadYr}>
                {acadYr}
              </option>
            ))}
          </select>

          <p>SEM:</p>
          <select
            className={styles.sortSelect}
            value={selectedSem}
            onChange={handleSemChange}
          >
            {uniqueSems.map((sem, index) => (
              <option key={index} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.tableAnalytics}>
          <div
            className={styles.chartContainer}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: "1rem",
            }}
          >
            {user.role === "prof" && (
              <img
                src={arrow}
                alt="analytics"
                width={20}
                height={20}
                style={{ transform: "scaleX(-1)", cursor: "pointer" }}
                onClick={() => setIsPageOne()}
              />
            )}
            <ResponsiveContainer width="50%" height={300}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip formatter={(value) => value} />
                <Legend />
                <Bar
                  dataKey="avgGrade"
                  fill={gradeColors[0]}
                  name="Average Grade"
                >
                  <LabelList dataKey="avgGrade" position="top" />
                </Bar>
                <Bar
                  dataKey="modeGrade"
                  fill={gradeColors[1]}
                  name="Mode Grade"
                >
                  <LabelList dataKey="modeGrade" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                flexDirection: "column",
                width: "50%",
                marginRight: "1rem",
                gap: "1rem",
              }}
            >
              {errorMessage === "" ? (
                <>
                  <p>
                    <strong>Interpretation: </strong> {interpret}
                  </p>
                  <p>
                    <strong>Insight: </strong> {insight}
                  </p>
                </>
              ) : (
                <p>No data found.</p>
              )}
            </div>
          </div>
        </div>
        ;
      </div>
    </div>
  );
};

export default GradeDistribution;
