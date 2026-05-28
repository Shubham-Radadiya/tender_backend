import { BillModel } from "../modules/bill/schema";
import { WorkOrderModel } from "../modules/workOrder/schema";

export type GenerateInvoiceOptions = {
  companyName?: string;
};

/** e.g. "Gopinath Infotech" -> "GI" */
export const getCompanyCodeFromName = (name?: string): string => {
  if (!name) return "XX";

  const companyNameStr = String(name).trim();
  const words = companyNameStr.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    const first = words[0][0] || "";
    const last = words[words.length - 1][0] || "";
    return `${first}${last}`.toUpperCase();
  }

  const capitals = companyNameStr.match(/[A-Z]/g);
  if (capitals && capitals.length >= 2) {
    return capitals.slice(0, 2).join("");
  }

  return companyNameStr.substring(0, 2).toUpperCase();
};

/** Indian financial year label, e.g. "2024-25" */
export const getFinancialYear = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }

  return `${year - 1}-${String(year).slice(-2)}`;
};

export const resolveCompanyName = (
  authUser: any,
  options?: GenerateInvoiceOptions,
): string => {
  if (options?.companyName?.trim()) {
    return options.companyName.trim();
  }

  const details = authUser?.companyDetails;
  if (details?.companyName?.trim()) {
    return details.companyName.trim();
  }

  const fullName = [authUser?.firstName, authUser?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) return fullName;

  if (authUser?.name?.trim()) return authUser.name.trim();

  return "";
};

const parseSequenceFromInvoice = (
  invoiceNumber: string | undefined,
  prefix: string,
): number => {
  if (!invoiceNumber || !invoiceNumber.startsWith(prefix)) return 0;
  const seqPart = invoiceNumber.slice(prefix.length);
  const parsed = parseInt(seqPart, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Format: GI/2024-25/01
 * - GI: company code from company name
 * - 2024-25: financial year (Apr–Mar)
 * - 01: incremental sequence per company + FY
 */
export const generateInvoiceNumber = async (
  authUser: any,
  options?: GenerateInvoiceOptions,
): Promise<string> => {
  const companyName = resolveCompanyName(authUser, options);
  const companyCode = getCompanyCodeFromName(companyName);
  const financialYear = getFinancialYear();
  const prefix = `${companyCode}/${financialYear}/`;

  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const invoicePattern = new RegExp(`^${escapedPrefix}\\d+$`);

  const [workOrders, bills] = await Promise.all([
    WorkOrderModel.find({ invoiceNumber: invoicePattern })
      .select("invoiceNumber")
      .lean(),
    BillModel.find({ invoiceNumber: invoicePattern })
      .select("invoiceNumber")
      .lean(),
  ]);

  const sequences = [
    ...workOrders.map((w) =>
      parseSequenceFromInvoice(w.invoiceNumber as string, prefix),
    ),
    ...bills.map((b) =>
      parseSequenceFromInvoice(b.invoiceNumber as string, prefix),
    ),
  ];

  const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0;
  const nextSeq = (maxSeq + 1).toString().padStart(2, "0");

  return `${prefix}${nextSeq}`;
};
