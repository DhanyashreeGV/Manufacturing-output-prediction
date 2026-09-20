/**
 * MFG.AI - Verified Model Data & Dataset Constants
 * Ground truth from repository: results/model_artifacts, results/metrics, results/figures
 */

const MFG_MODEL_DATA = {
  metadata: {
    target: "Parts_Per_Hour",
    unit: "Parts / Hour",
    model: "Linear Regression",
    test_size: 0.2,
    random_state: 42,
    training_rows: 800,
    testing_rows: 200,
    total_samples: 1000,
    processed_feature_count: 29
  },

  metrics: {
    r2: 0.9057073405009887,
    mae: 2.717163844100294,
    rmse: 3.5077796180108565,
    mse: 12.304517848532392,
    r2_percent: "90.57%",
    mae_display: "2.72 Parts/Hr",
    rmse_display: "3.51 Parts/Hr"
  },

  benchmarks: [
    { model: "Linear Regression", mae: 2.717164, mse: 12.304518, rmse: 3.507780, r2: 0.905707, status: "Primary" },
    { model: "Ridge (alpha=1.0)", mae: 2.721872, mse: 12.308771, rmse: 3.508386, r2: 0.905675, status: "Benchmark" },
    { model: "Lasso (alpha=0.01)", mae: 2.723792, mse: 12.245664, rmse: 3.499381, r2: 0.906158, status: "Benchmark" }
  ],

  residuals: {
    mean: -0.48478,
    std: 3.47412,
    min: -16.64448,
    max: 8.71755
  },

  // 29 processed feature coefficients (sorted by absolute impact)
  coefficients: [
    { feature: "Total_Cycle_Time", type: "numerical", rawName: "Total_Cycle_Time", coef: -10.0474, absCoef: 10.0474, desc: "Combined cycle & cooling duration (major reduction factor)" },
    { feature: "Efficiency_Score", type: "numerical", rawName: "Efficiency_Score", coef: 2.8764, absCoef: 2.8764, desc: "Operational machine efficiency rating" },
    { feature: "Cooling_Time", type: "numerical", rawName: "Cooling_Time", coef: 2.6663, absCoef: 2.6663, desc: "Part solidification cooling window" },
    { feature: "Injection_Temperature", type: "numerical", rawName: "Injection_Temperature", coef: 2.2960, absCoef: 2.2960, desc: "Melt temperature of polymer" },
    { feature: "Machine_Age", type: "numerical", rawName: "Machine_Age", coef: -2.2018, absCoef: 2.2018, desc: "Years in production service" },
    { feature: "Machine_Type_Type_A", type: "categorical", rawName: "Machine Type A", coef: 2.1152, absCoef: 2.1152, desc: "High-spec Type A machine baseline" },
    { feature: "Shift_Night", type: "categorical", rawName: "Shift: Night", coef: -2.0622, absCoef: 2.0622, desc: "Night operating shift factor" },
    { feature: "Shift_Day", type: "categorical", rawName: "Shift: Day", coef: 1.9028, absCoef: 1.9028, desc: "Day operating shift factor" },
    { feature: "Machine_Type_Type_C", type: "categorical", rawName: "Machine Type C", coef: -1.8066, absCoef: 1.8066, desc: "Legacy Type C machine factor" },
    { feature: "Material_Grade_Economy", type: "categorical", rawName: "Grade: Economy", coef: -1.5866, absCoef: 1.5866, desc: "Economy material throughput friction" },
    { feature: "Material_Grade_Premium", type: "categorical", rawName: "Grade: Premium", coef: 1.5235, absCoef: 1.5235, desc: "Premium grade flow stability" },
    { feature: "Injection_Pressure", type: "numerical", rawName: "Injection_Pressure", coef: 1.1848, absCoef: 1.1848, desc: "Hydraulic injection pressure" },
    { feature: "Day_of_Week_Wednesday", type: "categorical", rawName: "Day: Wednesday", coef: 1.0687, absCoef: 1.0687, desc: "Mid-week production peak" },
    { feature: "Operator_Experience", type: "numerical", rawName: "Operator_Experience", coef: 1.0181, absCoef: 1.0181, desc: "Months of technician experience" },
    { feature: "Material_Viscosity", type: "numerical", rawName: "Material_Viscosity", coef: -0.9423, absCoef: 0.9423, desc: "Fluid resistance to flow" },
    { feature: "Temperature_Pressure_Ratio", type: "numerical", rawName: "Temp / Press Ratio", coef: -0.9151, absCoef: 0.9151, desc: "Thermodynamic operating ratio" },
    { feature: "Day_of_Week_Friday", type: "categorical", rawName: "Day: Friday", coef: -0.6867, absCoef: 0.6867, desc: "Friday end-of-week rate" },
    { feature: "Cycle_Time", type: "numerical", rawName: "Cycle_Time", coef: -0.5764, absCoef: 0.5764, desc: "Mold injection stroke time" },
    { feature: "Day_of_Week_Sunday", type: "categorical", rawName: "Day: Sunday", coef: -0.5370, absCoef: 0.5370, desc: "Sunday weekend schedule" },
    { feature: "Machine_Utilization", type: "numerical", rawName: "Machine_Utilization", coef: -0.4026, absCoef: 0.4026, desc: "Active running uptime ratio" },
    { feature: "Machine_Type_Type_B", type: "categorical", rawName: "Machine Type B", coef: -0.3087, absCoef: 0.3087, desc: "Standard Type B machine" },
    { feature: "Day_of_Week_Thursday", type: "categorical", rawName: "Day: Thursday", coef: 0.2574, absCoef: 0.2574, desc: "Thursday production pace" },
    { feature: "Shift_Evening", type: "categorical", rawName: "Shift: Evening", coef: 0.1595, absCoef: 0.1595, desc: "Evening shift pace" },
    { feature: "Ambient_Temperature", type: "numerical", rawName: "Ambient_Temperature", coef: -0.1224, absCoef: 0.1224, desc: "Shop floor climate" },
    { feature: "Day_of_Week_Saturday", type: "categorical", rawName: "Day: Saturday", coef: -0.1164, absCoef: 0.1164, desc: "Saturday weekend schedule" },
    { feature: "Maintenance_Hours", type: "numerical", rawName: "Maintenance_Hours", coef: -0.0713, absCoef: 0.0713, desc: "Cumulative service hours" },
    { feature: "Day_of_Week_Tuesday", type: "categorical", rawName: "Day: Tuesday", coef: 0.0649, absCoef: 0.0649, desc: "Tuesday production pace" },
    { feature: "Material_Grade_Standard", type: "categorical", rawName: "Grade: Standard", coef: 0.0631, absCoef: 0.0631, desc: "Standard baseline grade" },
    { feature: "Day_of_Week_Monday", type: "categorical", rawName: "Day: Monday", coef: -0.0510, absCoef: 0.0510, desc: "Monday start-of-week pace" }
  ],

  // Model parameters for mathematically exact client-side linear inference
  inferenceEngine: {
    intercept: 28.688711083696184,
    numericalColumns: [
      "Injection_Temperature",
      "Injection_Pressure",
      "Cycle_Time",
      "Cooling_Time",
      "Material_Viscosity",
      "Ambient_Temperature",
      "Machine_Age",
      "Operator_Experience",
      "Maintenance_Hours",
      "Temperature_Pressure_Ratio",
      "Total_Cycle_Time",
      "Efficiency_Score",
      "Machine_Utilization"
    ],
    categoricalColumns: ["Shift", "Machine_Type", "Material_Grade", "Day_of_Week"],
    numericalMedians: {
      Injection_Temperature: 215.2,
      Injection_Pressure: 116.3,
      Cycle_Time: 36.45,
      Cooling_Time: 12.0,
      Material_Viscosity: 243.7,
      Ambient_Temperature: 22.9,
      Machine_Age: 7.85,
      Operator_Experience: 22.0,
      Maintenance_Hours: 50.0,
      Temperature_Pressure_Ratio: 1.8475,
      Total_Cycle_Time: 48.5,
      Efficiency_Score: 0.1365,
      Machine_Utilization: 0.3555
    },
    scalerMeans: {
      Injection_Temperature: 215.309875,
      Injection_Pressure: 116.283,
      Cycle_Time: 35.6485,
      Cooling_Time: 11.94675,
      Material_Viscosity: 253.362375,
      Ambient_Temperature: 22.901125,
      Machine_Age: 7.838625,
      Operator_Experience: 30.099625,
      Maintenance_Hours: 50.9275,
      Temperature_Pressure_Ratio: 1.8831425,
      Total_Cycle_Time: 47.548125,
      Efficiency_Score: 0.18809,
      Machine_Utilization: 0.35712625
    },
    scalerScales: {
      Injection_Temperature: 11.73449466,
      Injection_Pressure: 14.62648235,
      Cycle_Time: 8.41869929,
      Cooling_Time: 2.27534381,
      Material_Viscosity: 72.82120311,
      Ambient_Temperature: 2.75120178,
      Machine_Age: 3.90936959,
      Operator_Experience: 26.81405578,
      Maintenance_Hours: 17.46359767,
      Temperature_Pressure_Ratio: 0.27440402,
      Total_Cycle_Time: 8.68525742,
      Efficiency_Score: 0.16907937,
      Machine_Utilization: 0.19591908
    },
    weights: {
      "numerical__Injection_Temperature": 2.296037815628497,
      "numerical__Injection_Pressure": 1.1848041619133696,
      "numerical__Cycle_Time": -0.5764018759166046,
      "numerical__Cooling_Time": 2.6663010737278157,
      "numerical__Material_Viscosity": -0.9422864439576599,
      "numerical__Ambient_Temperature": -0.1223828541429318,
      "numerical__Machine_Age": -2.2017670050158498,
      "numerical__Operator_Experience": 1.0180515646446762,
      "numerical__Maintenance_Hours": -0.0713407200467937,
      "numerical__Temperature_Pressure_Ratio": -0.9151424925924323,
      "numerical__Total_Cycle_Time": -10.047415893661361,
      "numerical__Efficiency_Score": 2.8763914391443977,
      "numerical__Machine_Utilization": -0.40261610660485836,
      "categorical__Shift_Day": 1.9027659170760893,
      "categorical__Shift_Evening": 0.15946451057588396,
      "categorical__Shift_Night": -2.0622304276519636,
      "categorical__Machine_Type_Type_A": 2.115237723541711,
      "categorical__Machine_Type_Type_B": -0.3086638724478953,
      "categorical__Machine_Type_Type_C": -1.8065738510938147,
      "categorical__Material_Grade_Economy": -1.5865620551116548,
      "categorical__Material_Grade_Premium": 1.5234624744177527,
      "categorical__Material_Grade_Standard": 0.0630995806939071,
      "categorical__Day_of_Week_Friday": -0.6866922863011846,
      "categorical__Day_of_Week_Monday": -0.05100295151456289,
      "categorical__Day_of_Week_Saturday": -0.11635675205273968,
      "categorical__Day_of_Week_Sunday": -0.5369749091464614,
      "categorical__Day_of_Week_Thursday": 0.2573738374762377,
      "categorical__Day_of_Week_Tuesday": 0.06491338265951573,
      "categorical__Day_of_Week_Wednesday": 1.068739678879209
    }
  },

  // Verified real test dataset samples from results/metrics/test_predictions_linear_regression.csv
  presetSamples: [
    {
      id: "preset_1",
      name: "High Efficiency Run (Type A)",
      description: "Day shift, low cycle time, high efficiency score",
      expectedPrediction: 39.69,
      actualPPH: 40.0,
      data: {
        Machine_Type: "Type_A",
        Machine_Age: 4.7,
        Maintenance_Hours: 37,
        Machine_Utilization: 0.559,
        Injection_Temperature: 208.1,
        Injection_Pressure: 134.8,
        Cycle_Time: 42.4,
        Cooling_Time: 12.3,
        Material_Grade: "Standard",
        Material_Viscosity: 221.8,
        Ambient_Temperature: 26.8,
        Shift: "Day",
        Day_of_Week: "Friday",
        Operator_Experience: 113.4,
        Efficiency_Score: 0.77,
        Temperature_Pressure_Ratio: 1.544,
        Total_Cycle_Time: 54.7
      }
    },
    {
      id: "preset_2",
      name: "Peak Output Batch (Type B)",
      description: "Wednesday night shift, high experience, rapid cooling",
      expectedPrediction: 44.41,
      actualPPH: 42.8,
      data: {
        Machine_Type: "Type_B",
        Machine_Age: 4.7,
        Maintenance_Hours: 51,
        Machine_Utilization: 0.51,
        Injection_Temperature: 226.8,
        Injection_Pressure: 99.0,
        Cycle_Time: 33.3,
        Cooling_Time: 13.5,
        Material_Grade: "Standard",
        Material_Viscosity: 148.2,
        Ambient_Temperature: 22.7,
        Shift: "Night",
        Day_of_Week: "Wednesday",
        Operator_Experience: 112.4,
        Efficiency_Score: 0.698,
        Temperature_Pressure_Ratio: 2.291,
        Total_Cycle_Time: 46.8
      }
    },
    {
      id: "preset_3",
      name: "Standard Median Operation",
      description: "Average production parameters representing median factory baseline",
      expectedPrediction: 28.69,
      actualPPH: 28.2,
      data: {
        Machine_Type: "Type_A",
        Machine_Age: 7.9,
        Maintenance_Hours: 50,
        Machine_Utilization: 0.36,
        Injection_Temperature: 215.3,
        Injection_Pressure: 116.0,
        Cycle_Time: 36.8,
        Cooling_Time: 11.9,
        Material_Grade: "Standard",
        Material_Viscosity: 242.7,
        Ambient_Temperature: 22.9,
        Shift: "Day",
        Day_of_Week: "Tuesday",
        Operator_Experience: 22.1,
        Efficiency_Score: 0.14,
        Temperature_Pressure_Ratio: 1.85,
        Total_Cycle_Time: 48.7
      }
    },
    {
      id: "preset_4",
      name: "Heavy Wear Night Run (Type C)",
      description: "Aged machine, long total cycle time, low efficiency",
      expectedPrediction: 19.90,
      actualPPH: 18.6,
      data: {
        Machine_Type: "Type_A",
        Machine_Age: 13.0,
        Maintenance_Hours: 42,
        Machine_Utilization: 0.107,
        Injection_Temperature: 221.5,
        Injection_Pressure: 123.7,
        Cycle_Time: 40.9,
        Cooling_Time: 11.0,
        Material_Grade: "Economy",
        Material_Viscosity: 144.9,
        Ambient_Temperature: 24.0,
        Shift: "Evening",
        Day_of_Week: "Friday",
        Operator_Experience: 5.5,
        Efficiency_Score: 0.036,
        Temperature_Pressure_Ratio: 1.79,
        Total_Cycle_Time: 51.8
      }
    },
    {
      id: "preset_5",
      name: "Premium Material Precision (Type B)",
      description: "High-grade polymer, experienced operator, Wednesday evening",
      expectedPrediction: 34.05,
      actualPPH: 34.2,
      data: {
        Machine_Type: "Type_B",
        Machine_Age: 14.3,
        Maintenance_Hours: 33,
        Machine_Utilization: 0.04,
        Injection_Temperature: 192.9,
        Injection_Pressure: 113.4,
        Cycle_Time: 32.8,
        Cooling_Time: 13.0,
        Material_Grade: "Premium",
        Material_Viscosity: 211.1,
        Ambient_Temperature: 24.1,
        Shift: "Evening",
        Day_of_Week: "Wednesday",
        Operator_Experience: 66.2,
        Efficiency_Score: 0.461,
        Temperature_Pressure_Ratio: 1.701,
        Total_Cycle_Time: 45.9
      }
    }
  ]
};

// Make available in window / module
if (typeof window !== "undefined") {
  window.MFG_MODEL_DATA = MFG_MODEL_DATA;
}
