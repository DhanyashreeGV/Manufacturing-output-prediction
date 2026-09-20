/**
 * MFG.AI - API Integration & Inference Layer
 * Handles communication with backend server or evaluates using verified regression weights.
 */

class MfgApiClient {
  constructor() {
    this.endpoint = localStorage.getItem("mfg_api_endpoint") || "http://127.0.0.1:8000/api/predict";
    this.mode = localStorage.getItem("mfg_api_mode") || "auto"; // "auto", "api", "local"
    this.timeoutMs = 4000;
  }

  setEndpoint(url) {
    this.endpoint = url;
    localStorage.setItem("mfg_api_endpoint", url);
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem("mfg_api_mode", mode);
  }

  /**
   * Validate parameters before submission
   */
  validatePayload(params) {
    const errors = {};
    const requiredNum = [
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
    ];

    const requiredCat = {
      Shift: ["Day", "Evening", "Night"],
      Machine_Type: ["Type_A", "Type_B", "Type_C"],
      Material_Grade: ["Economy", "Standard", "Premium"],
      Day_of_Week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    };

    requiredNum.forEach((field) => {
      const val = params[field];
      if (val === undefined || val === null || val === "" || isNaN(Number(val))) {
        errors[field] = "This numerical parameter is required.";
      } else {
        const num = Number(val);
        if (field === "Injection_Temperature" && (num < 150 || num > 350)) {
          errors[field] = "Temperature must be between 150°C and 350°C.";
        }
        if (field === "Injection_Pressure" && (num < 50 || num > 200)) {
          errors[field] = "Pressure must be between 50 bar and 200 bar.";
        }
        if (field === "Cycle_Time" && (num <= 0 || num > 120)) {
          errors[field] = "Cycle time must be between 1s and 120s.";
        }
        if (field === "Cooling_Time" && (num <= 0 || num > 60)) {
          errors[field] = "Cooling time must be between 1s and 60s.";
        }
        if (field === "Machine_Utilization" && (num < 0 || num > 1)) {
          errors[field] = "Utilization ratio must be between 0.0 and 1.0.";
        }
        if (field === "Efficiency_Score" && (num < 0 || num > 1)) {
          errors[field] = "Efficiency score must be between 0.0 and 1.0.";
        }
      }
    });

    for (const [field, allowed] of Object.entries(requiredCat)) {
      const val = params[field];
      if (!val || !allowed.includes(val)) {
        errors[field] = `Select a valid option (${allowed.join(", ")}).`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Run exact linear inference using verified repository weights
   */
  evaluateLocalModel(params) {
    const engine = MFG_MODEL_DATA.inferenceEngine;
    let prediction = engine.intercept;

    // 1. Process numerical features
    for (const col of engine.numericalColumns) {
      let val = Number(params[col]);
      if (isNaN(val)) {
        val = engine.numericalMedians[col];
      }
      const mean = engine.scalerMeans[col];
      const scale = engine.scalerScales[col];
      const standardized = (val - mean) / scale;
      const weightKey = `numerical__${col}`;
      const weight = engine.weights[weightKey] || 0;
      prediction += standardized * weight;
    }

    // 2. Process categorical features with One-Hot encoding
    for (const catCol of engine.categoricalColumns) {
      const val = params[catCol];
      // Categories defined in dataset
      const categories = {
        Shift: ["Day", "Evening", "Night"],
        Machine_Type: ["Type_A", "Type_B", "Type_C"],
        Material_Grade: ["Economy", "Premium", "Standard"],
        Day_of_Week: ["Friday", "Monday", "Saturday", "Sunday", "Thursday", "Tuesday", "Wednesday"]
      };

      for (const catVal of categories[catCol] || []) {
        const dummy = val === catVal ? 1.0 : 0.0;
        const weightKey = `categorical__${catCol}_${catVal}`;
        const weight = engine.weights[weightKey] || 0;
        prediction += dummy * weight;
      }
    }

    // Sanity clamp: manufacturing parts per hour cannot be strictly negative
    const finalPrediction = Math.max(0, prediction);

    return {
      predicted_parts_per_hour: Math.round(finalPrediction * 100) / 100,
      raw_prediction: finalPrediction,
      unit: "Parts / Hour",
      model: "Linear Regression (Embedded)",
      source: "embedded_model",
      r2: MFG_MODEL_DATA.metrics.r2,
      mae: MFG_MODEL_DATA.metrics.mae,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Predict manufacturing output
   */
  async predict(params) {
    // 1. Validate inputs
    const validation = this.validatePayload(params);
    if (!validation.isValid) {
      const err = new Error("Validation failed for input parameters.");
      err.validationErrors = validation.errors;
      throw err;
    }

    // If local mode is forced, skip network attempt
    if (this.mode === "local") {
      // Simulate realistic ML inference latency (350ms)
      await new Promise((resolve) => setTimeout(resolve, 350));
      return this.evaluateLocalModel(params);
    }

    // Attempt live API request
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(params),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        predicted_parts_per_hour: data.predicted_parts_per_hour ?? data.parts_per_hour ?? data.prediction,
        unit: data.unit || "Parts / Hour",
        model: data.model || "Linear Regression (Backend API)",
        source: "backend_api",
        timestamp: new Date().toISOString(),
        rawResponse: data
      };
    } catch (networkError) {
      // If mode is strictly API, throw the error to show API Error state
      if (this.mode === "api") {
        const error = new Error(`Failed to connect to API endpoint (${this.endpoint}): ${networkError.message}`);
        error.isApiError = true;
        error.original = networkError;
        throw error;
      }

      // In Auto mode: fallback gracefully to embedded model engine
      console.warn("Backend API not reachable at", this.endpoint, "- Falling back to embedded Linear Regression model.");
      await new Promise((resolve) => setTimeout(resolve, 400));
      const localResult = this.evaluateLocalModel(params);
      localResult.fallbackNotice = `Live API (${this.endpoint}) unreachable. Calculated using verified repository Linear Regression model weights.`;
      return localResult;
    }
  }
}

if (typeof window !== "undefined") {
  window.MfgApiClient = MfgApiClient;
}
