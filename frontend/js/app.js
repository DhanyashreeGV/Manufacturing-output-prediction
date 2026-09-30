/**
 * MFG.AI - Manufacturing Output Intelligence
 * Core Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Api Client
  const apiClient = new MfgApiClient();

  // State Management
  const state = {
    currentTab: "dashboard",
    history: JSON.parse(localStorage.getItem("mfg_prediction_history") || "[]"),
    autoSyncDerived: true,
    lastPrediction: null
  };

  // DOM Elements
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view-content");
  const form = document.getElementById("prediction-form");
  const btnPredict = document.getElementById("btn-predict");
  const btnReset = document.getElementById("btn-reset");
  const presetsContainer = document.getElementById("presets-chips");
  const autoSyncCheckbox = document.getElementById("auto-sync-derived");

  // Output State Containers
  const stateEmpty = document.getElementById("state-empty");
  const stateLoading = document.getElementById("state-loading");
  const stateSuccess = document.getElementById("state-success");
  const stateError = document.getElementById("state-error");
  const resultCard = document.getElementById("prediction-result-card");

  // Output Elements
  const outputValue = document.getElementById("output-value");
  const outputBadge = document.getElementById("output-badge");
  const outputDelta = document.getElementById("output-delta");
  const outputSource = document.getElementById("output-source");
  const outputDetails = document.getElementById("output-details");
  const fallbackNotice = document.getElementById("fallback-notice");

  // Insights & History Elements
  const benchmarkTableBody = document.getElementById("benchmark-table-body");
  const coefBarsContainer = document.getElementById("coef-bars-container");
  const historyTableBody = document.getElementById("history-table-body");
  const historyEmptyMsg = document.getElementById("history-empty-msg");
  const btnClearHistory = document.getElementById("btn-clear-history");
  const btnExportHistory = document.getElementById("btn-export-history");

  // Settings Elements
  const apiEndpointInput = document.getElementById("setting-api-endpoint");
  const apiModeSelect = document.getElementById("setting-api-mode");
  const btnSaveSettings = document.getElementById("btn-save-settings");

  // Mobile Menu
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const appSidebar = document.getElementById("app-sidebar");

  // Lightbox
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  /* ==========================================================================
     1. Navigation & View Routing
     ========================================================================== */
  function switchTab(tabName) {
    state.currentTab = tabName;

    navItems.forEach((item) => {
      if (item.dataset.tab === tabName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    views.forEach((view) => {
      if (view.id === `view-${tabName}`) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });

    // Close mobile menu if open
    if (appSidebar.classList.contains("open")) {
      appSidebar.classList.remove("open");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      appSidebar.classList.toggle("open");
    });
  }

  // Cross-link buttons (e.g., hero button to prediction)
  document.querySelectorAll("[data-navigate]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(btn.dataset.navigate);
    });
  });

  /* ==========================================================================
     2. Form Data Handling & Auto-Calculation
     ========================================================================== */
  function getFormData() {
    const data = {};
    const elements = form.elements;

    for (let el of elements) {
      if (!el.name) continue;
      if (el.type === "number") {
        data[el.name] = el.value === "" ? "" : Number(el.value);
      } else if (el.tagName === "SELECT") {
        data[el.name] = el.value;
      }
    }
    return data;
  }

  function setFormData(data) {
    for (const [key, val] of Object.entries(data)) {
      const el = form.elements[key];
      if (el) {
        el.value = val;
        el.classList.remove("is-invalid");
        const errEl = document.getElementById(`err-${key}`);
        if (errEl) errEl.classList.remove("show");
      }
    }
  }

  // Auto-sync derived parameters
  function updateDerivedMetrics() {
    if (!state.autoSyncDerived) return;

    const temp = parseFloat(form.elements["Injection_Temperature"].value);
    const press = parseFloat(form.elements["Injection_Pressure"].value);
    const cycle = parseFloat(form.elements["Cycle_Time"].value);
    const cooling = parseFloat(form.elements["Cooling_Time"].value);

    // Temperature_Pressure_Ratio = Injection_Temperature / Injection_Pressure
    if (!isNaN(temp) && !isNaN(press) && press > 0) {
      const ratio = (temp / press).toFixed(3);
      form.elements["Temperature_Pressure_Ratio"].value = ratio;
    }

    // Total_Cycle_Time = Cycle_Time + Cooling_Time
    if (!isNaN(cycle) && !isNaN(cooling)) {
      const totalCycle = (cycle + cooling).toFixed(1);
      form.elements["Total_Cycle_Time"].value = totalCycle;
    }
  }

  ["Injection_Temperature", "Injection_Pressure", "Cycle_Time", "Cooling_Time"].forEach((field) => {
    const el = form.elements[field];
    if (el) {
      el.addEventListener("input", updateDerivedMetrics);
    }
  });

  if (autoSyncCheckbox) {
    autoSyncCheckbox.addEventListener("change", (e) => {
      state.autoSyncDerived = e.target.checked;
      const ratioEl = form.elements["Temperature_Pressure_Ratio"];
      const totalEl = form.elements["Total_Cycle_Time"];
      if (state.autoSyncDerived) {
        ratioEl.setAttribute("readonly", true);
        totalEl.setAttribute("readonly", true);
        updateDerivedMetrics();
      } else {
        ratioEl.removeAttribute("readonly");
        totalEl.removeAttribute("readonly");
      }
    });
  }

  /* ==========================================================================
     3. Presets Bar
     ========================================================================== */
  function renderPresets() {
    presetsContainer.innerHTML = "";
    MFG_MODEL_DATA.presetSamples.forEach((preset, idx) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `preset-chip ${idx === 0 ? "active" : ""}`;
      chip.textContent = preset.name;
      chip.title = `${preset.description} (~${preset.expectedPrediction} Parts/Hr)`;

      chip.addEventListener("click", () => {
        document.querySelectorAll(".preset-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        setFormData(preset.data);
        showToast(`Loaded "${preset.name}" preset parameters.`);
      });

      presetsContainer.appendChild(chip);
    });

    // Populate with first preset by default
    if (MFG_MODEL_DATA.presetSamples.length > 0) {
      setFormData(MFG_MODEL_DATA.presetSamples[0].data);
    }
  }

  /* ==========================================================================
     4. Prediction Execution Flow
     ========================================================================== */
  function setUiState(uiState) {
    stateEmpty.classList.remove("active");
    stateLoading.classList.remove("active");
    stateSuccess.classList.remove("active");
    stateError.classList.remove("active");
    resultCard.classList.remove("success-glow");

    if (uiState === "empty") {
      stateEmpty.classList.add("active");
      btnPredict.disabled = false;
      btnPredict.innerHTML = 'Predict Output <span class="arrow">→</span>';
    } else if (uiState === "loading") {
      stateLoading.classList.add("active");
      btnPredict.disabled = true;
      btnPredict.innerHTML = '<span class="loading-spinner" style="width:16px;height:16px;margin:0;border-width:2px;display:inline-block;vertical-align:middle;"></span> Evaluating Parameters...';
    } else if (uiState === "success") {
      stateSuccess.classList.add("active");
      resultCard.classList.add("success-glow");
      btnPredict.disabled = false;
      btnPredict.innerHTML = 'Predict Output <span class="arrow">→</span>';
    } else if (uiState === "error") {
      stateError.classList.add("active");
      btnPredict.disabled = false;
      btnPredict.innerHTML = 'Retry Prediction <span class="arrow">→</span>';
    }
  }

  function clearValidationErrors() {
    form.querySelectorAll(".form-input, .form-select").forEach((el) => {
      el.classList.remove("is-invalid");
    });
    form.querySelectorAll(".field-error-msg").forEach((el) => {
      el.classList.remove("show");
    });
  }

  function displayValidationErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
      const el = form.elements[field];
      if (el) {
        el.classList.add("is-invalid");
        const errEl = document.getElementById(`err-${field}`);
        if (errEl) {
          errEl.textContent = message;
          errEl.classList.add("show");
        }
      }
    }
  }

  async function executePrediction() {
    clearValidationErrors();
    const payload = getFormData();

    // Set Loading State
    setUiState("loading");

    try {
      const result = await apiClient.predict(payload);
      state.lastPrediction = {
        payload,
        result,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        date: new Date().toLocaleDateString()
      };

      // Add to Session History
      addHistoryRecord(state.lastPrediction);

      // Render Result Card
      renderPredictionResult(result, payload);

      // Set Success State
      setUiState("success");
      showToast(`Prediction complete: ${result.predicted_parts_per_hour} Parts / Hour`);
    } catch (err) {
      if (err.validationErrors) {
        setUiState("empty");
        displayValidationErrors(err.validationErrors);
        showToast("Please review the highlighted validation errors.", "warning");
      } else {
        // Network or API Error
        setUiState("error");
        document.getElementById("error-title").textContent = "API Service Notice";
        document.getElementById("error-message").textContent = err.message || "Failed to reach model prediction endpoint.";
      }
    }
  }

  function renderPredictionResult(result, payload) {
    const pph = Number(result.predicted_parts_per_hour);
    outputValue.textContent = pph.toFixed(1);

    // Baseline median in training set is ~28.2 Parts/Hour
    const median = 28.2;
    const diff = (pph - median).toFixed(1);
    const diffSign = diff >= 0 ? `+${diff}` : `${diff}`;

    if (pph >= 38.0) {
      outputBadge.className = "output-badge optimal";
      outputBadge.textContent = "Optimal Output";
      outputDelta.innerHTML = `<span class="delta-label">Vs Benchmark (28.2):</span> <span class="delta-val" style="color:var(--color-success)">${diffSign} Parts/Hr (High Efficiency)</span>`;
    } else if (pph >= 24.0) {
      outputBadge.className = "output-badge nominal";
      outputBadge.textContent = "Nominal Run";
      outputDelta.innerHTML = `<span class="delta-label">Vs Benchmark (28.2):</span> <span class="delta-val" style="color:var(--text-accent)">${diffSign} Parts/Hr (Standard Pace)</span>`;
    } else {
      outputBadge.className = "output-badge reduced";
      outputBadge.textContent = "Reduced Rate";
      outputDelta.innerHTML = `<span class="delta-label">Vs Benchmark (28.2):</span> <span class="delta-val" style="color:var(--color-warning)">${diffSign} Parts/Hr (Pace Throttled)</span>`;
    }

    // Source indication
    outputSource.textContent = result.source === "backend_api" ? "Live Backend API" : "Verified Linear Regression Model";

    // Fallback notice
    if (result.fallbackNotice) {
      fallbackNotice.style.display = "flex";
      document.getElementById("fallback-notice-text").textContent = result.fallbackNotice;
    } else {
      fallbackNotice.style.display = "none";
    }

    // Parameters summary pills
    outputDetails.innerHTML = `
      <div class="detail-row">
        <span class="detail-title">Machine / Shift</span>
        <span class="detail-value">${payload.Machine_Type} · ${payload.Shift}</span>
      </div>
      <div class="detail-row">
        <span class="detail-title">Total Cycle Time</span>
        <span class="detail-value">${payload.Total_Cycle_Time}s (Cycle ${payload.Cycle_Time}s + Cool ${payload.Cooling_Time}s)</span>
      </div>
      <div class="detail-row">
        <span class="detail-title">Melt Temp / Pressure</span>
        <span class="detail-value">${payload.Injection_Temperature}°C · ${payload.Injection_Pressure} bar</span>
      </div>
      <div class="detail-row">
        <span class="detail-title">Material / Viscosity</span>
        <span class="detail-value">${payload.Material_Grade} · ${payload.Material_Viscosity} cP</span>
      </div>
    `;
  }

  // Handle Form Submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    executePrediction();
  });

  btnReset.addEventListener("click", () => {
    form.reset();
    clearValidationErrors();
    setUiState("empty");
    if (MFG_MODEL_DATA.presetSamples.length > 0) {
      setFormData(MFG_MODEL_DATA.presetSamples[0].data);
    }
    showToast("Reset form to default parameters.");
  });

  // Handle Error Retries
  document.getElementById("btn-retry-api")?.addEventListener("click", () => {
    executePrediction();
  });

  document.getElementById("btn-fallback-eval")?.addEventListener("click", () => {
    apiClient.setMode("local");
    apiModeSelect.value = "local";
    executePrediction();
  });

  /* ==========================================================================
     5. Prediction History
     ========================================================================== */
  function addHistoryRecord(record) {
    state.history.unshift(record);
    if (state.history.length > 25) {
      state.history.pop();
    }
    localStorage.setItem("mfg_prediction_history", JSON.stringify(state.history));
    renderHistory();
  }

  function renderHistory() {
    if (!historyTableBody) return;
    historyTableBody.innerHTML = "";

    if (state.history.length === 0) {
      historyEmptyMsg.style.display = "block";
      return;
    }

    historyEmptyMsg.style.display = "none";

    state.history.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="color:var(--text-muted);font-size:0.8rem;">${item.timestamp}</td>
        <td><span style="font-weight:600;color:var(--text-primary);">${item.payload.Machine_Type}</span> · ${item.payload.Shift}</td>
        <td>${item.payload.Total_Cycle_Time}s</td>
        <td>${item.payload.Efficiency_Score}</td>
        <td>${item.payload.Material_Grade}</td>
        <td>
          <span style="font-weight:700;color:var(--text-accent);font-size:1.05rem;">
            ${Number(item.result.predicted_parts_per_hour).toFixed(1)}
          </span> 
          <span style="font-size:0.75rem;color:var(--text-muted);">Parts/Hr</span>
        </td>
        <td>
          <button type="button" class="btn-secondary btn-rerun" data-index="${index}" style="padding:4px 10px;font-size:0.75rem;">
            Re-load
          </button>
        </td>
      `;

      tr.querySelector(".btn-rerun").addEventListener("click", () => {
        setFormData(item.payload);
        switchTab("prediction");
        showToast(`Loaded prediction parameters from ${item.timestamp}.`);
      });

      historyTableBody.appendChild(tr);
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      state.history = [];
      localStorage.removeItem("mfg_prediction_history");
      renderHistory();
      showToast("Cleared session prediction history.");
    });
  }

  if (btnExportHistory) {
    btnExportHistory.addEventListener("click", () => {
      if (state.history.length === 0) {
        showToast("No prediction history to export.", "warning");
        return;
      }

      let csv = "Timestamp,Machine_Type,Shift,Material_Grade,Injection_Temperature,Injection_Pressure,Cycle_Time,Cooling_Time,Total_Cycle_Time,Efficiency_Score,Machine_Utilization,Predicted_Parts_Per_Hour\n";
      state.history.forEach((h) => {
        const p = h.payload;
        csv += `"${h.timestamp}","${p.Machine_Type}","${p.Shift}","${p.Material_Grade}",${p.Injection_Temperature},${p.Injection_Pressure},${p.Cycle_Time},${p.Cooling_Time},${p.Total_Cycle_Time},${p.Efficiency_Score},${p.Machine_Utilization},${h.result.predicted_parts_per_hour}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `mfg_predictions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Exported session history to CSV.");
    });
  }

  /* ==========================================================================
     6. Model Insights & Visualizations
     ========================================================================== */
  function renderInsights() {
    // Benchmark table
    if (benchmarkTableBody) {
      benchmarkTableBody.innerHTML = "";
      MFG_MODEL_DATA.benchmarks.forEach((b) => {
        const tr = document.createElement("tr");
        if (b.status === "Primary") tr.className = "primary-row";
        tr.innerHTML = `
          <td><strong>${b.model}</strong></td>
          <td>${b.mae.toFixed(4)}</td>
          <td>${b.rmse.toFixed(4)}</td>
          <td>${b.mse.toFixed(4)}</td>
          <td><strong>${b.r2.toFixed(4)}</strong></td>
          <td><span class="stat-badge" style="${b.status === "Primary" ? "background:var(--accent-gold-bg);color:var(--text-accent);" : ""}">${b.status}</span></td>
        `;
        benchmarkTableBody.appendChild(tr);
      });
    }

    // Top Coefficients Bar Chart
    if (coefBarsContainer) {
      coefBarsContainer.innerHTML = "";
      const maxAbs = Math.max(...MFG_MODEL_DATA.coefficients.map((c) => c.absCoef));

      MFG_MODEL_DATA.coefficients.forEach((item) => {
        const pct = Math.min(100, Math.round((item.absCoef / maxAbs) * 100));
        const isPos = item.coef >= 0;
        const sign = isPos ? "+" : "";

        const row = document.createElement("div");
        row.className = "coef-row";
        row.innerHTML = `
          <div class="coef-name" title="${item.desc} (${item.rawName})">
            ${item.rawName}
          </div>
          <div class="coef-bar-track">
            <div class="coef-bar-fill ${isPos ? "positive" : "negative"}" style="width: ${pct}%"></div>
          </div>
          <div class="coef-val ${isPos ? "positive" : "negative"}">
            ${sign}${item.coef.toFixed(3)}
          </div>
        `;
        coefBarsContainer.appendChild(row);
      });
    }

    // Lightbox for evaluation figures
    document.querySelectorAll(".figure-item").forEach((fig) => {
      fig.addEventListener("click", () => {
        const img = fig.querySelector("img");
        const title = fig.querySelector(".figure-title").textContent;
        lightboxImg.src = img.src;
        lightboxCaption.textContent = title;
        lightboxModal.classList.add("active");
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", () => {
        lightboxModal.classList.remove("active");
      });
    }

    if (lightboxModal) {
      lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) {
          lightboxModal.classList.remove("active");
        }
      });
    }
  }

  /* ==========================================================================
     7. Settings Panel & API Configuration
     ========================================================================== */
  function initSettings() {
    if (apiEndpointInput) apiEndpointInput.value = apiClient.endpoint;
    if (apiModeSelect) apiModeSelect.value = apiClient.mode;

    if (btnSaveSettings) {
      btnSaveSettings.addEventListener("click", () => {
        const endpoint = apiEndpointInput.value.trim();
        const mode = apiModeSelect.value;
        if (!endpoint) {
          showToast("Endpoint URL cannot be empty.", "warning");
          return;
        }
        apiClient.setEndpoint(endpoint);
        apiClient.setMode(mode);
        showToast("Settings updated successfully.");
      });
    }
  }

  /* ==========================================================================
     8. Toast Notification Utility
     ========================================================================== */
  function showToast(message, type = "info") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";

    let iconSvg = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if (type === "warning") {
      iconSvg = '<svg width="16" height="16" fill="none" stroke="#fbbf24" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
    }

    toast.innerHTML = `
      <span style="color:${type === "warning" ? "#fbbf24" : "var(--accent-gold)"};display:flex;">${iconSvg}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Initial Boot
  renderPresets();
  renderInsights();
  renderHistory();
  initSettings();
  setUiState("empty");
});
