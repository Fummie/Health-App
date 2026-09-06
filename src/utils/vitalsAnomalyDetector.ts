import { VitalRecord, HealthAlert, HealthAlertTriggerMetric, AlertSeverity } from '../types';

export interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  alert: HealthAlert | null;
}

/**
 * Compares current vital records against clinical guidelines and previous readings
 * to detect physiological dangers, acute shifts, and health implications.
 */
export function evaluateVitalsAnomaly(
  current: VitalRecord,
  previous?: VitalRecord,
  existingAlerts: HealthAlert[] = []
): HealthAlert | null {
  const triggerMetrics: HealthAlertTriggerMetric[] = [];
  let severity: AlertSeverity = 'warning';
  let conditionKey = '';
  let conditionTitle = '';
  const clinicalImplications: string[] = [];
  const immediateDirectives: string[] = [];

  // Helper to calculate trend comparison string
  const diffSys = previous ? current.systolicBP - previous.systolicBP : 0;
  const diffDia = previous ? current.diastolicBP - previous.diastolicBP : 0;
  const diffHR = previous ? current.heartRate - previous.heartRate : 0;
  const diffSpo2 = previous ? current.spo2 - previous.spo2 : 0;

  // 1. HYPERTENSIVE CRISIS / STAGE 2 HYPERTENSION
  if (current.systolicBP >= 180 || current.diastolicBP >= 120) {
    conditionKey = 'hypertensive_urgency';
    conditionTitle = 'Hypertensive Crisis / Acute Blood Pressure Spike';
    severity = 'critical';

    triggerMetrics.push({
      label: 'Systolic Blood Pressure',
      value: current.systolicBP,
      unit: 'mmHg',
      safeRange: '< 120 mmHg',
      status: 'Critical Hypertensive Crisis',
      trendComparison: previous ? `${diffSys >= 0 ? '+' : ''}${diffSys} mmHg change` : undefined,
    });

    triggerMetrics.push({
      label: 'Diastolic Blood Pressure',
      value: current.diastolicBP,
      unit: 'mmHg',
      safeRange: '< 80 mmHg',
      status: 'Critical Hypertensive Crisis',
      trendComparison: previous ? `${diffDia >= 0 ? '+' : ''}${diffDia} mmHg change` : undefined,
    });

    clinicalImplications.push(
      'Acute risk of cerebrovascular event (stroke) and end-organ microvascular hemorrhage.',
      'Marked left ventricular strain with elevated myocardial oxygen demand.',
      'Potential encephalopathy, retinal arteriolar spasm, or acute renal hyperfiltration.'
    );

    immediateDirectives.push(
      'Cease all physical exertion immediately. Sit upright and remain calm.',
      'If experiencing chest pain, shortness of breath, numbness, or visual disturbance, seek immediate emergency medical care (Call 911/112).',
      'Do not consume caffeine, nicotine, or high-sodium foods.',
      'Documented Physician Consultation & Medical Clearance is required to clear this telemetry flag.'
    );
  } else if (
    current.systolicBP >= 140 || 
    current.diastolicBP >= 90 || 
    (previous && diffSys >= 26)
  ) {
    conditionKey = 'stage_2_hypertension';
    conditionTitle = 'Stage 2 Hypertension / Rapid Vascular Surge';
    severity = 'urgent';

    triggerMetrics.push({
      label: 'Blood Pressure',
      value: `${current.systolicBP}/${current.diastolicBP}`,
      unit: 'mmHg',
      safeRange: '< 120/80 mmHg',
      status: 'Stage 2 Hypertension',
      trendComparison: previous ? `${diffSys >= 0 ? '+' : ''}${diffSys}/${diffDia >= 0 ? '+' : ''}${diffDia} mmHg change` : undefined,
    });

    clinicalImplications.push(
      'Sustained systemic arterial resistance and cardiac afterload increase.',
      'Acceleration of endothelial friction and sympathetic overactivity.',
      'Increased long-term cardiovascular risk if not pharmacologically or clinically controlled.'
    );

    immediateDirectives.push(
      'Re-measure after 5 minutes of quiet seated rest with back supported.',
      'Hydrate with plain water and practice slow diaphragmatic breathing.',
      'Schedule a formal physician consultation to evaluate antihypertensive medication or lifestyle protocol.'
    );
  }

  // 2. SEVERE HYPOTENSION (SHOCK / SYNCOPE DANGER)
  else if (current.systolicBP < 90 || current.diastolicBP < 55) {
    conditionKey = 'severe_hypotension';
    conditionTitle = 'Severe Hypotension / Circulatory Hypoperfusion';
    severity = 'urgent';

    triggerMetrics.push({
      label: 'Blood Pressure',
      value: `${current.systolicBP}/${current.diastolicBP}`,
      unit: 'mmHg',
      safeRange: '90-120 / 60-80 mmHg',
      status: 'Severe Low Blood Pressure',
      trendComparison: previous ? `${diffSys} mmHg change` : undefined,
    });

    clinicalImplications.push(
      'Inadequate cerebral perfusion leading to dizziness, syncope (fainting), and orthostatic collapse.',
      'Risk of diminished organ perfusion and reflex tachycardia.'
    );

    immediateDirectives.push(
      'Lie down and elevate legs above heart level to assist venous return.',
      'Drink electrolyte fluids slowly. Avoid abrupt standing.',
      'Notify your primary care doctor if symptoms of lightheadedness or confusion persist.'
    );
  }

  // 3. RESPIRATORY HYPOXIA (SpO2)
  else if (current.spo2 < 93 || (previous && diffSpo2 <= -5 && current.spo2 < 95)) {
    conditionKey = 'acute_hypoxemia';
    conditionTitle = current.spo2 < 90 ? 'Critical Acute Hypoxemia' : 'Moderate Respiratory Desaturation';
    severity = current.spo2 < 90 ? 'critical' : 'urgent';

    triggerMetrics.push({
      label: 'Blood Oxygen (SpO2)',
      value: current.spo2,
      unit: '%',
      safeRange: '95 - 100%',
      status: current.spo2 < 90 ? 'Critical Hypoxia' : 'Low Blood Oxygen',
      trendComparison: previous ? `${diffSpo2 >= 0 ? '+' : ''}${diffSpo2}% shift` : undefined,
    });

    clinicalImplications.push(
      'Impaired pulmonary gas exchange and arterial hemoglobin desaturation.',
      'Cellular tissue hypoxia, accelerated cardiac workload, and secondary tachypnea.',
      'Potential underlying airway restriction, bronchospasm, or pulmonary pathology.'
    );

    immediateDirectives.push(
      'Warm hands and re-check sensor placement on a different finger.',
      'Sit fully upright in high Fowler position to maximize lung expansion.',
      'If SpO2 remains below 92% or is accompanied by cyanosis or dyspnea, seek immediate urgent medical evaluation.'
    );
  }

  // 4. SEVERE TACHYCARDIA / BRADYCARDIA
  else if (current.heartRate >= 125 || current.heartRate <= 45 || (previous && diffHR >= 35 && current.heartRate > 110)) {
    const isFast = current.heartRate >= 100;
    conditionKey = isFast ? 'severe_tachycardia' : 'severe_bradycardia';
    conditionTitle = isFast ? 'Severe Tachycardia / Cardiac Arrhythmia Alert' : 'Severe Bradycardia / Conduction Delay Alert';
    severity = current.heartRate >= 135 || current.heartRate <= 40 ? 'critical' : 'urgent';

    triggerMetrics.push({
      label: 'Resting Heart Rate',
      value: current.heartRate,
      unit: 'bpm',
      safeRange: '60 - 100 bpm',
      status: isFast ? 'Elevated Pulse Rate' : 'Depressed Pulse Rate',
      trendComparison: previous ? `${diffHR >= 0 ? '+' : ''}${diffHR} bpm jump` : undefined,
    });

    clinicalImplications.push(
      isFast
        ? 'Shortened ventricular diastole reducing coronary perfusion and stroke volume.'
        : 'Inadequate cardiac output to sustain optimal systemic organ perfusion.',
      'Potential supraventricular reentry, atrial arrhythmia, or electrolyte disequilibrium.'
    );

    immediateDirectives.push(
      'Rest seated in a cool room. Avoid physical exertion and stimulants.',
      'Perform gentle vagal maneuvers (slow deep exhalation) if familiar.',
      'Undergo medical evaluation and 12-lead ECG to rule out pathological dysrhythmias.'
    );
  }

  // 5. GLYCEMIC CRISIS
  else if (current.bloodGlucose && (current.bloodGlucose <= 65 || current.bloodGlucose >= 220)) {
    const isLow = current.bloodGlucose <= 65;
    conditionKey = isLow ? 'severe_hypoglycemia' : 'severe_hyperglycemia';
    conditionTitle = isLow ? 'Severe Hypoglycemia / Acute Neuroglycopenia Risk' : 'Severe Hyperglycemia / Metabolic Crisis Risk';
    severity = isLow && current.bloodGlucose <= 55 ? 'critical' : 'urgent';

    triggerMetrics.push({
      label: 'Blood Glucose',
      value: current.bloodGlucose,
      unit: 'mg/dL',
      safeRange: '70 - 140 mg/dL',
      status: isLow ? 'Critical Low Blood Sugar' : 'Severe High Blood Sugar',
      trendComparison: previous?.bloodGlucose ? `${current.bloodGlucose - previous.bloodGlucose >= 0 ? '+' : ''}${current.bloodGlucose - previous.bloodGlucose} mg/dL change` : undefined,
    });

    clinicalImplications.push(
      isLow
        ? 'Rapid cerebral glucose deprivation risking disorientation, seizures, and loss of consciousness.'
        : 'Elevated plasma osmolarity, osmotic diuresis, and risk of diabetic ketoacidosis (DKA) or hyperosmolar syndrome.'
    );

    immediateDirectives.push(
      isLow
        ? 'Apply the Rule of 15: Ingest 15g fast-acting carbohydrates (fruit juice or glucose tablets). Re-check in 15 minutes.'
        : 'Hydrate generously with plain water. Monitor for ketones. Contact physician for insulin/medication adjustments.'
    );
  }

  // 6. HYPERPYREXIA / HIGH FEVER
  else if (current.bodyTempC >= 39.0) {
    conditionKey = 'severe_hyperpyrexia';
    conditionTitle = 'High Pyrexia / Severe Febrile Inflammatory Spike';
    severity = 'urgent';

    triggerMetrics.push({
      label: 'Core Body Temperature',
      value: `${current.bodyTempC}°C (${((current.bodyTempC * 9/5) + 32).toFixed(1)}°F)`,
      unit: '°C',
      safeRange: '36.5 - 37.5°C',
      status: 'High Fever / Hyperpyrexia',
    });

    clinicalImplications.push(
      'Systemic inflammatory response with increased metabolic demand.',
      'Potential bacteremia, acute infection, or thermoregulatory dysfunction.'
    );

    immediateDirectives.push(
      'Rest in a cool room, apply tepid compresses, and maintain fluid intake.',
      'Consult physician for antipyretic guidance and etiology diagnostics.'
    );
  }

  // If no danger condition triggered, return null
  if (!conditionKey) {
    return null;
  }

  // Check if there is already an active (unresolved) alert for this exact condition
  const existingActive = existingAlerts.find(
    (a) => a.conditionKey === conditionKey && a.status !== 'resolved'
  );

  if (existingActive) {
    // Already active and waiting for doctor checkup.
    return null;
  }

  // Construct new clinical alert
  const newAlert: HealthAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    conditionKey,
    conditionTitle,
    severity,
    detectedAt: current.timestamp || new Date().toISOString(),
    triggerVitalId: current.id,
    triggerMetrics,
    clinicalImplications,
    immediateDirectives,
    status: 'active_unacknowledged',
  };

  return newAlert;
}
