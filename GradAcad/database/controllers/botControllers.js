function generateInterpretation(pieData) {
    const passed = pieData.find(item => item.name === "Passed")?.value || 0;
    const failed = pieData.find(item => item.name === "Failed")?.value || 0;
    return `Out of all students, ${passed}% passed and ${failed}% failed.`;
  }
  
function generateInsight(passed) {
    if (passed >= 80) {
      return "Great job! The majority of students performed well.";
    } else if (passed >= 50) {
      return "A decent result, but there's room for improvement.";
    } else {
      return "Less than half passed. Consider academic interventions.";
    }
  }  


  export const pieChatBot = async (req, res) => {
    try {
      const { pieData } = req.body;
  
      if (!pieData || !Array.isArray(pieData)) {
        return res.status(400).json({ message: "Invalid or missing pieData." });
      }
  
      const passedValue = pieData.find(item => item.name === "Passed")?.value || 0;
  
      const interpretation = generateInterpretation(pieData);
      const insight = generateInsight(passedValue);
  
      res.status(200).json({ success: true, interpret: interpretation, insight: insight });
    } catch (error) {
      console.error("Error generating pie chat response:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  export const barChatBot = async (req, res) => {
    try {
      const { gradeData } = req.body;
  
      if (!gradeData || !Array.isArray(gradeData)) {
        return res
          .status(400)
          .json({ message: "Invalid or missing gradeData." });
      }
  
      // --- Interpretation: Build a sentence for each subject
      const interpretationLines = gradeData.map((data) => {
        return `• ${data.subject}: average grade is ${data.avgGrade}, mode is ${data.modeGrade}`;
      });
  
      const interpretation = `Based on the student grade distribution across subjects:\n${interpretationLines.join(
        "\n"
      )}.`;
  
      // --- Insight: Generate simple, helpful analysis
      const allAverages = gradeData.map((d) => d.avgGrade);
      const maxAvg = Math.max(...allAverages);
      const minAvg = Math.min(...allAverages);
  
      const topSubject = gradeData.find((d) => d.avgGrade === maxAvg)?.subject;
      const lowestSubject = gradeData.find((d) => d.avgGrade === minAvg)?.subject;
  
      let insight = `The subject with the highest average performance is ${topSubject} (${maxAvg}), while the subject with the lowest is ${lowestSubject} (${minAvg}).`;
  
      if (maxAvg >= 85 && minAvg >= 75) {
        insight +=
          " Overall, the students show a strong performance across all subjects.";
      } else if (minAvg < 75) {
        insight +=
          " Consider reviewing content or teaching methods in subjects with lower averages.";
      } else {
        insight +=
          " The performance is generally balanced, but some subjects may require reinforcement strategies.";
      }
  
      return res
        .status(200)
        .json({ success: true, interpret: interpretation, insight: insight });
    } catch (error) {
      console.error("Error generating bar chart response:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  