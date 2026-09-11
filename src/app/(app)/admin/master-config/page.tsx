"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { invalidateMasterConfig } from "@/lib/hooks";
import { PageHead, Subtabs, Badge, Modal } from "@/components/ui";
import type { MasterConfig, AdminUser } from "@/lib/types";
type Sub = "dept" | "stage" | "prob" | "type";
type Kind = "departments" | "stages" | "types" | "statuses";
interface Edit { kind: Kind; id?: number; name: string; code: string; defaultOwner: string; allowedFor: string[]; }
export default function MasterConfigPage() {
  const toast = useToast();
  const [config, setConfig] = useState<MasterConfig | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sub, setSub] = useState<Sub>("dept");
  const [form, setForm] = useState<Edit | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [ruleEdit, setRuleEdit] = useState<"wonProbability" | "poProbability" | null>(null);
  const [ruleValue, setRuleValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{kind: Kind; id: number; name: string} | null>(null);
  async function load() { const [c,u] = await Promise.all([api<MasterConfig>("/api/master-config"), api<AdminUser[]>("/api/admin/users")]); setConfig(c); setUsers(u); }
  useEffect(() => { load().catch(e=>setError(e.message)); }, []);
  function open(kind: Kind, item?: Partial<Edit>) { setError(""); setForm({kind, name:"", code:"", defaultOwner:"", allowedFor:[], ...item}); }
  async function save() {
    if (!form) return; setBusy(true); setError("");
    try {
      await api(`/api/admin/master-config/${form.kind}`, {method:"POST", body: { id:form.id, name:form.name, code:form.code, defaultOwner:form.defaultOwner, allowedFor:form.allowedFor }});
      invalidateMasterConfig(); await load(); setForm(null); toast.push("บันทึก Master สำเร็จ", "success");
    } catch(e) { setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ"); } finally { setBusy(false); }
  }
  async function remove() {
    if (!pendingDelete) return; setBusy(true); setError("");
    try { await api(`/api/admin/master-config/${pendingDelete.kind}/${pendingDelete.id}`, {method:"DELETE"}); invalidateMasterConfig(); await load(); setPendingDelete(null); }
    catch(e) { setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ"); } finally { setBusy(false); }
  }
  async function saveRule() {
    if (!ruleEdit) return; setBusy(true); setError("");
    try { await api("/api/admin/master-config/rules", {method:"PUT", body:{key:ruleEdit==="wonProbability"?"XREF_WON_PROBABILITY":"XREF_PO_PROBABILITY", value:ruleValue}}); invalidateMasterConfig(); await load(); setRuleEdit(null); toast.push("บันทึกกฎสำเร็จ", "success"); }
    catch(e) { setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ"); } finally { setBusy(false); }
  }
  if (!config) return <div className="panel panel-body">{error || "กำลังโหลด…"}</div>;
  const title: Record<Kind,string> = {departments:"Department",stages:"Deal Stage",types:"Deal Type",statuses:"Deal Status"};
  return <div className="stack">
    <PageHead title="Master Data" subtitle="จัดการรายการตัวเลือกและกฎของระบบ" />
    <div className="warn-banner">การเปลี่ยนกฎมีผลกับดีลในระบบ ค่าที่มีการอ้างอิงหรือเป็นค่าของระบบจะเปลี่ยนชื่อ/ลบไม่ได้</div>
    {error && !form && !pendingDelete && <div className="warn-banner" role="alert">{error}</div>}
    <div className="panel">
      <Subtabs value={sub} onChange={setSub} items={[{value:"dept",label:"Department"},{value:"stage",label:"Deal Stage"},{value:"prob",label:"Probability → Situation"},{value:"type",label:"Deal Type / Status"}]} />
      <div className="subpanel">
        {sub === "dept" && <>
          <div className="table-wrap"><table><thead><tr><th className="col-no">No.</th><th>Department</th><th>ชื่อเต็ม</th><th>Deal Owner (Lock)</th><th>Manager ที่ผูก</th><th /></tr></thead><tbody>
            {config.departments.map((d,i)=><tr key={d.id}><td className="col-no">{i+1}</td><td className="cell-strong">{d.code}</td><td>{d.name}</td><td>{d.defaultOwner || "—"}</td><td>{users.filter(u=>u.departmentId===d.id && u.role==="MANAGER" && u.active).map(u=>u.fullName).join(", ") || "—"}</td><td><button className="rowbtn" title={`แก้ไข ${d.code}`} aria-label={`แก้ไข ${d.code}`} onClick={()=>open("departments",d)}>✎</button></td></tr>)}
          </tbody></table></div>
          <div className="master-actions"><button className="btn btn-sm" onClick={()=>open("departments")}>+ เพิ่มแผนก</button></div>
        </>}
        {sub === "stage" && <>
          <div className="rule-line"><b style={{width:120}}>Deal Status</b><span className="arrow">→</span><b>Deal Stage ที่เลือกได้</b></div>
          {config.dealStatuses.map(status=><div className="rule-line" key={status}><b style={{width:120,flexShrink:0}}>{status}</b><span className="arrow">→</span><div className="chiprow">{config.dealStages.filter(s=>s.allowedFor.includes(status)).map(s=><span className="chip" key={s.id}><button className="linkbtn" onClick={()=>open("stages",s)}>{s.name}</button><button className="rowbtn" title={`ลบ ${s.name}`} aria-label={`ลบ ${s.name}`} onClick={()=>{setError("");setPendingDelete({kind:"stages",id:s.id,name:s.name});}}>×</button></span>)}</div></div>)}
          <div className="master-actions"><button className="btn btn-sm" onClick={()=>open("stages")}>+ เพิ่ม Deal Stage</button></div>
        </>}
        {sub === "prob" && <>
          <div className="table-wrap"><table><thead><tr><th className="col-no">No.</th><th>Probability</th><th>Situation (คำนวณอัตโนมัติ)</th></tr></thead><tbody>{config.probabilities.map((p,i)=><tr key={p.probability}><td className="col-no">{i+1}</td><td>{p.probability}</td><td><Badge tone={p.situation==="Best Case"?"success":p.situation==="Worst Case"?"danger":"warning"}>{p.situation}</Badge></td></tr>)}</tbody></table></div>
          {(["wonProbability","poProbability"] as const).map(key=><div className="rule-line" key={key}><b>{key==="wonProbability"?"Won":"PO"}</b><span>ต้องมี Probability</span>{ruleEdit===key?<><select aria-label="Probability ของกฎ" value={ruleValue} onChange={e=>setRuleValue(e.target.value)}>{config.probabilities.map(p=><option key={p.probability}>{p.probability}</option>)}</select><button className="btn btn-primary btn-sm" disabled={busy} onClick={saveRule}>บันทึก</button><button className="btn btn-sm" disabled={busy} onClick={()=>setRuleEdit(null)}>ยกเลิก</button></>:<><Badge tone="info">{config.rules[key]}</Badge><button className="btn btn-sm" onClick={()=>{setRuleEdit(key);setRuleValue(config.rules[key]);setError("");}}>Edit</button></>}</div>)}
        </>}
        {sub === "type" && <div className="form-grid">
          {(["types","statuses"] as const).map(kind=><div key={kind}><h3>{title[kind]}</h3><div className="chiprow" style={{marginTop:12}}>{(kind==="types"?config.typeOptions:config.statusOptions).map(item=><span className="chip" key={item.id}><button className="linkbtn" onClick={()=>open(kind,item)}>{item.name}</button><button className="rowbtn" title={`ลบ ${item.name}`} aria-label={`ลบ ${item.name}`} onClick={()=>{setError("");setPendingDelete({kind,id:item.id,name:item.name});}}>×</button></span>)}</div><div className="master-actions"><button className="btn btn-sm" onClick={()=>open(kind)}>+ เพิ่ม {title[kind]}</button></div></div>)}
        </div>}
      </div>
    </div>
    <Modal open={!!form} onClose={()=>{if(!busy)setForm(null);}} width={560}>
      {form && <><div className="modal-head"><h3>{form.id?"แก้ไข":"เพิ่ม"} {title[form.kind]}</h3><button className="icon-x" aria-label="ปิด" disabled={busy} onClick={()=>setForm(null)}>×</button></div><div className="mpanel">
        {error && <div className="warn-banner" role="alert">{error}</div>}
        <div className="form-grid" style={{gridTemplateColumns:"1fr"}}>
          {form.kind==="departments" && <div className="form-field"><label>รหัสแผนก *</label><input maxLength={20} value={form.code} onChange={e=>setForm({...form,code:e.target.value})} /></div>}
          <div className="form-field"><label>{form.kind==="departments"?"ชื่อเต็ม":"ชื่อ"} *</label><input maxLength={form.kind==="departments"?100:form.kind==="stages"?80:50} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          {form.kind==="departments" && <div className="form-field"><label>Deal Owner</label><input maxLength={100} value={form.defaultOwner} onChange={e=>setForm({...form,defaultOwner:e.target.value})} /></div>}
          {form.kind==="stages" && <fieldset><legend>Deal Status ที่อนุญาต *</legend>{config.dealStatuses.map(s=><label key={s} style={{display:"flex",gap:8,padding:6}}><input type="checkbox" checked={form.allowedFor.includes(s)} onChange={e=>setForm({...form,allowedFor:e.target.checked?[...form.allowedFor,s]:form.allowedFor.filter(v=>v!==s)})} />{s}</label>)}</fieldset>}
        </div>
      </div><div className="modal-foot"><button className="btn" disabled={busy} onClick={()=>setForm(null)}>ยกเลิก</button><button className="btn btn-primary" disabled={busy || !form.name.trim() || (form.kind==="departments"&&!form.code.trim()) || (form.kind==="stages"&&!form.allowedFor.length)} onClick={save}>{busy?"กำลังบันทึก…":"บันทึก"}</button></div></>}
    </Modal>
    <Modal open={!!pendingDelete} onClose={()=>{if(!busy)setPendingDelete(null);}} width={480}>
      <div className="modal-head"><h3>ยืนยันลบ {pendingDelete?.name}</h3></div><div className="mpanel">ลบได้เฉพาะรายการที่ไม่มีข้อมูลอ้างอิง{error&&<div className="warn-banner" role="alert">{error}</div>}</div><div className="modal-foot"><button className="btn" disabled={busy} onClick={()=>setPendingDelete(null)}>ยกเลิก</button><button className="btn btn-primary" disabled={busy} onClick={remove}>ยืนยันลบ</button></div>
    </Modal>
  </div>;
}
