"use client";
import { useEffect, useState } from "react";
import { SETTINGS } from "@/lib/erp/schema";
import { getSettings, saveSettings } from "@/lib/erp/data";
import { Card, Btn, SchemaForm, useRefOptions } from "./ui";

export default function SettingsForm({ settingsKey }) {
  const def = SETTINGS[settingsKey];
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const refOptions = useRefOptions(def.fields);

  // ErpSection mounts this with key={settingsKey}, so state starts fresh per form.
  useEffect(() => {
    getSettings(settingsKey).then(setValues).catch(e => { setMsg(e.message); setValues({}); });
  }, [settingsKey]);

  if (!values) return <Card>Loading…</Card>;

  const save = async () => {
    setSaving(true); setMsg("");
    try { const { updatedAt, ...rest } = values; await saveSettings(settingsKey, rest); setMsg("Saved."); }
    catch (e) { setMsg(e.message); } finally { setSaving(false); }
  };

  return (
    <Card title={def.title} actions={<Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>}>
      <SchemaForm fields={def.fields} values={values} setValues={setValues} refOptions={refOptions} folder={`settings_${settingsKey}`} />
      {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg === "Saved." ? "#047857" : "#dc2626" }}>{msg}</div>}
    </Card>
  );
}
