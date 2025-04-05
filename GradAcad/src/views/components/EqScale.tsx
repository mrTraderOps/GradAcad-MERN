import React from "react";
import EqScale from "../pages/MainPage/fragments/students_panel/EqScale";
import { useTerm } from "../../hooks/useTerm";

interface EqScaleProps {
  isVisible: boolean;
  onClose: () => void;
}

export const GradingReference: React.FC<EqScaleProps> = ({
  isVisible,
  onClose,
}) => {
  const { activeAcadYrs } = useTerm();

  return (
    <EqScale isVisible={isVisible} onClose={onClose}>
      <h2>GRADING SYSTEM</h2>
      <h4>
        The Norzagaray College {`A.Y. ${activeAcadYrs} `} utilizes the grading
        system below:
      </h4>
      <h5>RAW SCORE COMPUTATION</h5>
      <p>
        Class Performance {"(60%)"} + Major Exam {"(30%)"} + Attendance{" "}
        {"(10%)"} = 100
      </p>
      <table>
        <thead>
          <tr>
            <th>RAW SCORE</th>
            <th>GRADE EQUIVALENT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>97 - 100</td>
            <td>1.00</td>
          </tr>
          <tr>
            <td>94 - 96</td>
            <td>1.25</td>
          </tr>
          <tr>
            <td>91 - 93</td>
            <td>1.50</td>
          </tr>
          <tr>
            <td>88 - 90</td>
            <td>1.75</td>
          </tr>
          <tr>
            <td>85 - 87</td>
            <td>2.00</td>
          </tr>
          <tr>
            <td>82 - 84</td>
            <td>2.25</td>
          </tr>
          <tr>
            <td>79 - 81</td>
            <td>2.50</td>
          </tr>
          <tr>
            <td>76 - 78</td>
            <td>2.75</td>
          </tr>
          <tr>
            <td>75</td>
            <td>3.00</td>
          </tr>
          <tr>
            <td>below 75</td>
            <td>5.00</td>
          </tr>
          <tr>
            <td>AW</td>
            <td>Authorized Withdrawal</td>
          </tr>
          <tr>
            <td>UW</td>
            <td>Unauthorized Withdrawal</td>
          </tr>
          <tr>
            <td>NCA</td>
            <td>No Credit Due to Absences</td>
          </tr>
          <tr>
            <td>INC</td>
            <td>Incomplete</td>
          </tr>
        </tbody>
      </table>
    </EqScale>
  );
};
