import type { DealFormValues, FieldError, MasterConfig } from "./types";

/**
 * Client mirror of backend DealValidator (validation-business-rules-spec.md §2–§4).
 * Server stays the source of truth — this is for inline UX only.
 */

export function situationFor(probability: string, config: MasterConfig): string {
  return config.probabilities.find((p) => p.probability === probability)?.situation ?? "";
}

export function stagesForStatus(status: string, config: MasterConfig): string[] {
  return config.dealStages.filter((s) => s.allowedFor.includes(status)).map((s) => s.name);
}

/** Empty filter means all statuses; multiple statuses use the union of their stages. */
export function stagesForStatuses(statuses: string[], config: MasterConfig): string[] {
  return config.dealStages
    .filter(s => !statuses.length || s.allowedFor.some(status => statuses.includes(status)))
    .map(s => s.name);
}

export function withStatusFilter<T extends { dealStatus: string[]; dealStage: string[] }>(
  filters: T, statuses: string[], config: MasterConfig | null,
): T {
  const allowed = config ? stagesForStatuses(statuses, config) : [];
  return { ...filters, dealStatus: statuses, dealStage: filters.dealStage.filter(s => allowed.includes(s)) };
}

const AMOUNT_RE = /^[0-9,]+(\.[0-9]{1,2})?$/;

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

/** Live cross-field hint for the Probability field (rule §4) — shown while typing, does not block. */
export function crossFieldHint(values: DealFormValues, config: MasterConfig): string | null {
  const { dealStage, probability } = values;
  if (!probability) return null;
  if (dealStage === "Won" && probability !== config.rules.wonProbability) {
    return `Deal Stage = Won ต้องมี Probability = ${config.rules.wonProbability}`;
  }
  if (dealStage === "PO" && probability !== config.rules.poProbability) {
    return `Deal Stage = PO ต้องมี Probability = ${config.rules.poProbability}`;
  }
  return null;
}

export function validateDeal(values: DealFormValues, config: MasterConfig): FieldError[] {
  const errors: FieldError[] = [];
  const add = (field: string, code: string, message: string) => errors.push({ field, code, message });

  if (!values.departmentId) add("departmentId", "REQ-DEPT", "กรุณาเลือกแผนก");
  if (!values.customer.trim()) add("customer", "REQ-CUSTOMER", "กรุณากรอกชื่อลูกค้า");
  if (!config.dealTypes.includes(values.dealType)) add("dealType", "REQ-DEALTYPE", "กรุณาเลือก Deal Type");
  if (!values.dealName.trim()) add("dealName", "REQ-DEALNAME", "กรุณากรอกชื่อ Deal");

  const statusOk = config.dealStatuses.includes(values.dealStatus);
  if (!statusOk) add("dealStatus", "REQ-STATUS", "กรุณาเลือก Deal Status");

  if (!values.dealStage) {
    add("dealStage", "REQ-STAGE", "กรุณาเลือก Deal Stage");
  } else if (statusOk && !stagesForStatus(values.dealStatus, config).includes(values.dealStage)) {
    add("dealStage", "RULE-STAGE-CASCADE", "Deal Stage ไม่ตรงกับ Deal Status ที่เลือก");
  }

  const probOk = config.probabilities.some((p) => p.probability === values.probability);
  if (!probOk) add("probability", "REQ-PROB", "กรุณาเลือก Probability");

  if (!/^\d{4}-\d{2}$/.test(values.closedDate)) add("closedDate", "REQ-CLOSEDDATE", "กรุณาเลือก Closed Date");

  if (!values.amount.trim()) {
    add("amount", "REQ-AMOUNT", "กรุณากรอก Amount เป็นตัวเลข");
  } else if (!AMOUNT_RE.test(values.amount) || (parseAmount(values.amount) ?? 0) <= 0) {
    add("amount", "FMT-AMOUNT", "กรุณากรอก Amount เป็นตัวเลขบวก");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.createdDate)) {
    add("createdDate", "REQ-CREATEDDATE", "กรุณาเลือก Created Date");
  }

  if (probOk && values.dealStage) {
    if (values.dealStage === "Won" && values.probability !== config.rules.wonProbability) {
      add("probability", "XREF-WON-PROB",
        `Deal Stage = Won ต้องมี Probability = ${config.rules.wonProbability} ก่อนบันทึก`);
    }
    if (values.dealStage === "PO" && values.probability !== config.rules.poProbability) {
      add("probability", "XREF-PO-PROB",
        `Deal Stage = PO ต้องมี Probability = ${config.rules.poProbability} ก่อนบันทึก`);
    }
  }

  return errors;
}
