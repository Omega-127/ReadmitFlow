import { Action, AuditEvent, Override, Patient, RiskTier } from './types';
import { formatCurrency, formatDate, formatDateTime, formatScore, getTierConfig } from './formatters';

export interface HandoffPayload {
  patient: Patient;
  effectiveTier: RiskTier;
  override?: Override;
  actions: Action[];
  auditEvents: AuditEvent[];
  generatedAt?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildHandoffText(payload: HandoffPayload): string {
  const { patient, effectiveTier, override, actions, auditEvents } = payload;
  const generatedAt = payload.generatedAt || new Date().toISOString();
  const tier = getTierConfig(effectiveTier);
  const topDrivers = (patient.risk_drivers || []).slice(0, 3);

  const lines: string[] = [
    'READMITFLOW — SHIFT HANDOFF',
    'Decision support only. Synthetic / demo data. Not for diagnosis or treatment.',
    `Generated: ${formatDateTime(generatedAt)}`,
    '',
    'PATIENT',
    `ID: ${patient.id}`,
    `Name: ${patient.display_name}`,
    `Age / sex: ${patient.age} / ${patient.gender}`,
    `Condition: ${patient.medical_condition}`,
    `Admission: ${patient.admission_type} · ${formatDate(patient.admission_date)}`,
    `Discharge: ${formatDate(patient.discharge_date)}`,
    `Hospital: ${patient.hospital}`,
    `Payer: ${patient.insurance_provider}${patient.billing_amount != null ? ` · ${formatCurrency(patient.billing_amount)}` : ''}`,
    patient.medication ? `Meds: ${patient.medication}` : '',
    '',
    'RISK',
    `Tier: ${tier.label} (${formatScore(patient.risk_score)})`,
    `Follow-up window: ${tier.timeframe}`,
    `Guidance: ${tier.description}`,
    `Confidence: ${patient.confidence_level}${patient.confidence_flags?.length ? ` · flags: ${patient.confidence_flags.join('; ')}` : ''}`,
  ];

  if (override) {
    lines.push(
      '',
      'OVERRIDE',
      `Changed from ${override.previous_tier} → ${override.selected_tier}`,
      `By: ${override.clinician_name} · ${formatDateTime(override.timestamp)}`,
      `Reason: ${override.reason}`
    );
  }

  lines.push('', 'TOP RISK DRIVERS');
  if (topDrivers.length === 0) {
    lines.push('(none recorded)');
  } else {
    topDrivers.forEach((d, i) => {
      lines.push(`${i + 1}. ${d.label} [${d.direction}] — ${d.summary}`);
    });
  }

  lines.push('', 'FOLLOW-UP ACTIONS');
  if (actions.length === 0) {
    lines.push('(none assigned)');
  } else {
    actions.forEach((a, i) => {
      lines.push(
        `${i + 1}. ${a.action_type}`,
        `   Status: ${a.status.replace('_', ' ')} · Owner: ${a.owner} · Due: ${formatDate(a.due_date)}`,
        a.notes ? `   Notes: ${a.notes}` : ''
      );
    });
  }

  lines.push('', 'RECENT ACTIVITY');
  const recent = auditEvents.slice(0, 8);
  if (recent.length === 0) {
    lines.push('(none)');
  } else {
    recent.forEach((ev) => {
      lines.push(`- ${formatDateTime(ev.timestamp)} · ${ev.actor} · ${ev.details}`);
    });
  }

  lines.push(
    '',
    'NEXT SHIFT CHECKLIST',
    '[ ] Confirm reachable contact / caregiver',
    '[ ] Review open follow-ups and due dates',
    '[ ] Re-check confidence / data gaps if flagged',
    '[ ] Escalate if high risk and no action in progress',
    '',
    '— End of handoff —'
  );

  return lines.filter((l) => l !== undefined).join('\n');
}

export function buildHandoffCsv(payload: HandoffPayload): string {
  const { patient, effectiveTier, override, actions } = payload;
  const generatedAt = payload.generatedAt || new Date().toISOString();
  const rows: string[][] = [
    ['section', 'field', 'value'],
    ['meta', 'generated_at', generatedAt],
    ['meta', 'notice', 'Decision support only. Synthetic demo data.'],
    ['patient', 'id', patient.id],
    ['patient', 'display_name', patient.display_name],
    ['patient', 'age', String(patient.age)],
    ['patient', 'gender', patient.gender],
    ['patient', 'condition', patient.medical_condition],
    ['patient', 'admission_type', patient.admission_type],
    ['patient', 'admission_date', patient.admission_date || ''],
    ['patient', 'discharge_date', patient.discharge_date || ''],
    ['patient', 'hospital', patient.hospital],
    ['patient', 'insurance', patient.insurance_provider],
    ['patient', 'medication', patient.medication || ''],
    ['risk', 'tier', effectiveTier],
    ['risk', 'score', String(patient.risk_score)],
    ['risk', 'confidence', patient.confidence_level],
  ];

  if (override) {
    rows.push(
      ['override', 'from', override.previous_tier],
      ['override', 'to', override.selected_tier],
      ['override', 'by', override.clinician_name],
      ['override', 'reason', override.reason],
      ['override', 'at', override.timestamp]
    );
  }

  actions.forEach((a, i) => {
    rows.push(
      [`action_${i + 1}`, 'type', a.action_type],
      [`action_${i + 1}`, 'status', a.status],
      [`action_${i + 1}`, 'owner', a.owner],
      [`action_${i + 1}`, 'due_date', a.due_date],
      [`action_${i + 1}`, 'notes', a.notes || '']
    );
  });

  (patient.risk_drivers || []).slice(0, 5).forEach((d, i) => {
    rows.push(
      [`driver_${i + 1}`, 'label', d.label],
      [`driver_${i + 1}`, 'direction', d.direction],
      [`driver_${i + 1}`, 'summary', d.summary]
    );
  });

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = String(cell).replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(',')
    )
    .join('\n');
}

export function buildHandoffHtml(payload: HandoffPayload): string {
  const text = buildHandoffText(payload);
  const { patient } = payload;
  const title = `Handoff — ${patient.id}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 32px; line-height: 1.45; }
    h1 { font-size: 20px; margin: 0 0 4px; font-family: system-ui, sans-serif; }
    .meta { color: #444; font-size: 12px; margin-bottom: 20px; font-family: system-ui, sans-serif; }
    pre { white-space: pre-wrap; font-family: ui-monospace, Consolas, monospace; font-size: 12px; }
    .notice { border: 1px solid #b45309; background: #fffbeb; padding: 10px 12px; font-size: 12px; margin-bottom: 16px; font-family: system-ui, sans-serif; }
    @media print {
      body { margin: 16px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px;font-family:system-ui,sans-serif;font-size:13px;">
    <button onclick="window.print()" style="padding:8px 12px;cursor:pointer;">Print / Save as PDF</button>
  </div>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">ReadmitFlow shift handoff · ${escapeHtml(formatDateTime(payload.generatedAt || new Date().toISOString()))}</p>
  <div class="notice">Decision support only. Synthetic / demo data. Not for diagnosis or treatment.</div>
  <pre>${escapeHtml(text)}</pre>
</body>
</html>`;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadHandoffPdf(payload: HandoffPayload): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const text = buildHandoffText(payload);
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 14;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`ReadmitFlow handoff — ${payload.patient.id}`, margin, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 80, 0);
  const notice = doc.splitTextToSize(
    'Decision support only. Synthetic / demo data. Not for diagnosis or treatment.',
    maxWidth
  );
  doc.text(notice, margin, y);
  y += notice.length * 12 + 12;
  doc.setTextColor(20, 20, 20);

  doc.setFont('courier', 'normal');
  doc.setFontSize(9);

  const lines = text.split('\n');
  for (const rawLine of lines) {
    const wrapped =
      rawLine.trim().length === 0
        ? ['']
        : (doc.splitTextToSize(rawLine, maxWidth) as string[]);

    for (const line of wrapped) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line || ' ', margin, y);
      y += lineHeight;
    }
  }

  doc.save(`readmitflow-handoff-${payload.patient.id}.pdf`);
}

export function openHandoffPrintWindow(payload: HandoffPayload): void {
  const html = buildHandoffHtml(payload);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
