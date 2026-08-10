import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TotpMfa({ onVerified, management=false }: { onVerified?:()=>void; management?:boolean }) {
  const [factorId,setFactorId]=useState<string|null>(null); const [qr,setQr]=useState<string|null>(null); const [secret,setSecret]=useState<string|null>(null);
  const [verified,setVerified]=useState(false); const [busy,setBusy]=useState(true); const [error,setError]=useState<string|null>(null);
  async function inspect(){ if(!supabase)return;setBusy(true);const {data,error:e}=await supabase.auth.mfa.listFactors();if(e){setError(e.message);setBusy(false);return}const factor=data.totp.find(f=>f.status==="verified");if(factor){setFactorId(factor.id);setVerified(true);setBusy(false);return}const {data:enrolled,error:enrollError}=await supabase.auth.mfa.enroll({factorType:"totp",friendlyName:"MiZanova authenticator"});if(enrollError){setError(enrollError.message);setBusy(false);return}setFactorId(enrolled.id);setQr(enrolled.totp.qr_code);setSecret(enrolled.totp.secret);setBusy(false)}
  useEffect(()=>{void inspect()},[]);
  async function verify(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!supabase||!factorId)return;setBusy(true);setError(null);const code=String(new FormData(e.currentTarget).get("code")||"").replace(/\s/g,"");const{data:challenge,error:ce}=await supabase.auth.mfa.challenge({factorId});if(ce){setError(ce.message);setBusy(false);return}const{error:ve}=await supabase.auth.mfa.verify({factorId,challengeId:challenge.id,code});if(ve){setError(ve.message);setBusy(false);return}setVerified(true);setBusy(false);onVerified?.()}
  async function challengeExisting(e:FormEvent<HTMLFormElement>){return verify(e)}
  async function remove(){if(!supabase||!factorId)return;const{error:e}=await supabase.auth.mfa.unenroll({factorId});if(e)setError(e.message);else{setFactorId(null);setVerified(false);setQr(null);setSecret(null);void inspect()}}
  if(!supabase)return <p className="text-sm text-muted">MFA becomes available when Supabase credentials are configured. Demo login does not simulate a security factor.</p>;
  if(busy)return <p role="status" className="text-sm text-muted">Preparing authenticator security…</p>;
  if(management&&verified)return <div><p className="text-sm font-semibold text-teal">✓ Authenticator app enrolled</p><p className="mt-1 text-xs text-muted">Sensitive school data requires an AAL2 session.</p><button onClick={()=>void remove()} className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Remove authenticator</button>{error&&<p className="mt-2 text-sm text-red-600">{error}</p>}</div>;
  return <form onSubmit={verified?challengeExisting:verify} className="space-y-4">
    {!verified&&qr&&<><p className="text-sm text-slate">Scan this QR code in your authenticator app. Enrollment is mandatory before school data opens.</p><img src={qr} alt="Authenticator enrollment QR code" className="mx-auto size-48"/><details className="text-xs text-muted"><summary>Cannot scan?</summary><code className="mt-2 block break-all rounded bg-mist p-2">{secret}</code></details></>}
    {verified&&<p className="text-sm text-slate">Enter the current six-digit code from your authenticator app.</p>}
    <input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" className="h-12 w-full rounded-lg border border-line px-4 text-center text-xl tracking-[.4em]"/>
    {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={busy} className="h-12 w-full rounded-lg bg-brand font-bold text-white">Verify and continue</button>
  </form>;
}
