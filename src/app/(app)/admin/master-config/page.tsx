"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { invalidateMasterConfig } from "@/lib/hooks";
import { PageHead, Subtabs, Badge } from "@/components/ui";
import type { MasterConfig } from "@/lib/types";

type Sub = "dept" | "stage" | "prob" | "type";

export default function MasterConfigPage() {
  const toast = useToast();
  const [config, setConfig] = useState<MasterConfig | null>(null);
  const [sub, setSub] = useState<Sub>("dept");
  const [wonProb, setWonProb] = useState("");
  const [poProb, setPoProb] = useState("");

  const load = () =>
    api<MasterConfig>("/api/master-config").then((c) => {
      setConfig(c);
      setWonProb(c.rules.wonProbability);
      setPoProb(c.rules.poProbability);
    });

  useEffect(() => {
    load();
  }, []);

  async function saveRule(key: string, value: string) {
    try {
      await api("/api/admin/master-config/rules", { method: "PUT", body: { key, value } });
      invalidateMasterConfig();
      toast.push("อัปเดตกฎแล้ว — มีผลกับ deal ทั้งหมด", "success");
      load();
    } catch (e) {
      toast.push(e instanceof ApiError ? e.message : "อัปเดตไม่สำเร็จ", "error");
    }
  }

  if (!config) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  const situationTone = (s: string) =>
    s === "Best Case" ? "success" : s === "Worst Case" ? "danger" : "warning";

  return (
    <div className="stack">
      <PageHead title="Master Data" subtitle="จัดการ dropdown list และกฎ business rule ของทั้งระบบ" />
      <div className="warn-banner" style={{ marginBottom: 16 }}>
        ⚠️ การแก้ไขค่าในหน้านี้มีผลกับดีลทั้งหมดที่ใช้งานอยู่ในระบบทันที
      </div>

      <div className="panel">
        <Subtabs
          value={sub}
          onChange={setSub}
          items={[
            { value: "dept", label: "แผนก (Department)" },
            { value: "stage", label: "Deal Stage" },
            { value: "prob", label: "Probability → Situation" },
            { value: "type", label: "Deal Type / Status" },
          ]}
        />

        {sub === "dept" && (
          <div className="subpanel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="col-no">No.</th>
                    <th>รหัสแผนก</th>
                    <th>ชื่อเต็ม</th>
                    <th>Deal Owner (Lock)</th>
                  </tr>
                </thead>
                <tbody>
                  {config.departments.map((d, i) => (
                    <tr key={d.code}>
                      <td className="col-no">{i + 1}</td>
                      <td className="cell-strong">{d.code}</td>
                      <td>{d.name}</td>
                      <td>{d.defaultOwner || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sub === "stage" && (
          <div className="subpanel">
            {config.dealStatuses.map((st) => {
              const stages = config.dealStages.filter((s) => s.allowedFor.includes(st));
              return (
                <div className="rule-line" key={st}>
                  <b style={{ width: 120 }}>{st}</b>
                  <span className="arrow">→</span>
                  <div className="chiprow">
                    {stages.map((s) => (
                      <span className="chip" key={s.name}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sub === "prob" && (
          <div className="subpanel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="col-no">No.</th>
                    <th>Probability</th>
                    <th>Situation (คำนวณอัตโนมัติ)</th>
                  </tr>
                </thead>
                <tbody>
                  {config.probabilities.map((p, i) => (
                    <tr key={p.probability}>
                      <td className="col-no">{i + 1}</td>
                      <td>{p.probability}</td>
                      <td>
                        <Badge tone={situationTone(p.situation)}>{p.situation}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rule-line" style={{ marginTop: 12, alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
              <b>Rule เพิ่มเติม (แก้ threshold ได้):</b>
              <label className="check" style={{ padding: 0, gap: 6 }}>
                Won ต้องมี Probability
                <select value={wonProb} onChange={(e) => setWonProb(e.target.value)} style={{ padding: "4px 8px" }}>
                  {config.probabilities.map((p) => (
                    <option key={p.probability}>{p.probability}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => saveRule("XREF_WON_PROBABILITY", wonProb)}>
                  บันทึก
                </button>
              </label>
              <label className="check" style={{ padding: 0, gap: 6 }}>
                PO ต้องมี Probability
                <select value={poProb} onChange={(e) => setPoProb(e.target.value)} style={{ padding: "4px 8px" }}>
                  {config.probabilities.map((p) => (
                    <option key={p.probability}>{p.probability}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => saveRule("XREF_PO_PROBABILITY", poProb)}>
                  บันทึก
                </button>
              </label>
            </div>
          </div>
        )}

        {sub === "type" && (
          <div className="subpanel">
            <div className="form-grid">
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Deal Type</div>
                <div className="chiprow">
                  {config.dealTypes.map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Deal Status</div>
                <div className="chiprow">
                  {config.dealStatuses.map((s) => (
                    <span className="chip" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
