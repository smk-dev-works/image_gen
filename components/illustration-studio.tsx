'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { looks, type Generation, type Look } from '@/lib/illustration';
import { monsterName, recipeKey, type Recipe } from '@/lib/recipe';
import { Monster } from './monster';
import { Icon } from './icons';

export function IllustrationStudio({ recipe, onRemix }: { recipe: Recipe; onRemix: (recipe: Recipe) => void }) {
  const [look, setLook] = useState<Look>('playful');
  const [config, setConfig] = useState<{ configured: boolean; model: string } | null>(null);
  const [records, setRecords] = useState<Generation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ recipe: Recipe; look: Look } | null>(null);
  const requestGuard = useRef(false);
  const load = useCallback(async () => {
    const response = await fetch('/api/generations', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not open your illustration collection.');
    setConfig({ configured: data.configured, model: data.model });
    setRecords(data.generations);
    return data.generations as Generation[];
  }, []);
  useEffect(() => { load().catch(error => setError(error.message)); }, [load]);
  const completed = records.filter(record => record.status === 'succeeded');
  const selected = completed.find(record => record.id === selectedId) || completed[0];
  const matches = selected && recipeKey(selected.recipe) === recipeKey(recipe);

  async function illustrate() {
    if (requestGuard.current) return;
    requestGuard.current = true;
    setBusy(true); setError('');
    const snapshot = structuredClone(recipe);
    const requestId = crypto.randomUUID();
    setPending({ recipe: snapshot, look });
    try {
      const response = await fetch('/api/generations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipe: snapshot, look, requestId }) });
      const record = await response.json();
      if (!response.ok) throw new Error(record.error || 'The illustration could not be completed.');
      if (record.status !== 'succeeded') throw new Error('This request is still being processed. Refresh the collection to check it; no automatic retry was sent.');
      setRecords(previous => [record, ...previous.filter(item => item.id !== record.id)]);
      setSelectedId(record.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not reach the illustration service. Check your collection before trying again.');
      // Recover a completed result if only the browser connection was lost.
      try {
        const recovered = await load();
        if (recovered.some(record => record.id === requestId && record.status === 'succeeded')) { setSelectedId(requestId); setError(''); }
      } catch { /* Preserve the original actionable error. */ }
    } finally { setBusy(false); setPending(null); requestGuard.current = false; }
  }

  return <section className="illustration-studio" aria-labelledby="studio-title">
    <div className="studio-header"><div><p className="eyebrow">KIDS’ MONSTER LAB · A LITTLE EXTRA MAGIC</p><h2 id="studio-title">Same friend. <em>Wild new world.</em></h2><p>Pick a look and bring your little weirdo to life.</p></div><span className="studio-badge"><Icon name="spark" size={15}/> AI ILLUSTRATION</span></div>
    <div className="studio-layout">
      <div className="studio-controls">
        <div className="look-options" role="group" aria-label="Illustration look">{looks.map(option => <button className={`look-card ${look === option.id ? 'active' : ''}`} key={option.id} onClick={() => setLook(option.id)} aria-pressed={look === option.id} disabled={busy}><span className={`look-symbol look-${option.id}`} aria-hidden="true">{option.symbol}</span><span><strong>{option.title}</strong><small>{option.description}</small></span><span className="look-radio" aria-hidden="true">{look === option.id ? '●' : '○'}</span></button>)}</div>
        <button className="illustrate-button" onClick={illustrate} disabled={busy || !config?.configured}><Icon name="spark" size={21}/>{busy ? 'Making a little magic…' : 'Illustrate my monster'}<span aria-hidden="true">↗</span></button>
        <p className="illustration-note">{busy ? `Cooking up ${monsterName(pending!.recipe)} in ${looks.find(item => item.id === pending!.look)!.title}. You can keep mixing above.` : config?.configured ? 'One image per click. Uses your OpenRouter credits. Rolling is always free.' : 'Add your OpenRouter key to .env.local, then restart the app to unlock illustrations.'}</p>
        <p className="interpretation-note">AI reimagines your design and may change little details. Your exact original is always kept.</p>
        {config?.configured && <details className="model-details"><summary>Image model</summary><p>{config.model} · high quality for OpenAI models</p></details>}
        {error && <p className="illustration-error" role="alert">{error}</p>}
      </div>
      <div className={`illustration-result ${busy ? 'is-cooking' : ''}`} aria-busy={busy}>
        {busy ? <div className="studio-empty"><div className="cooking-monster"><Monster recipe={pending!.recipe}/></div><strong>A masterpiece in the mixing.</strong><p>Good weird takes a little time.<br/>Your illustration will land here.</p><span className="cooking-dots" aria-hidden="true">● ● ●</span></div> : selected ? <>
          <div className="result-picture"><img src={`/api/generations/${selected.id}/image`} alt={`${monsterName(selected.recipe)} in the ${looks.find(item => item.id === selected.look)!.title} look`}/><span className="result-tag">{looks.find(item => item.id === selected.look)!.title}</span></div>
          <div className="result-caption"><div><strong>{monsterName(selected.recipe)}</strong><span>{matches ? 'Your monster, reimagined.' : 'A friend from an earlier mix.'}{typeof selected.cost === 'number' ? ` · $${selected.cost.toFixed(3)}` : ''}</span></div><a href={`/api/generations/${selected.id}/image?download=1`} aria-label="Download AI illustration" title="Download illustration"><Icon name="download" size={20}/></a></div>
          <div className="original-recipe"><Monster recipe={selected.recipe}/><span>Original recipe kept.<small>Locks preserve the mixer; AI details can vary.</small></span><button onClick={() => onRemix(structuredClone(selected.recipe))}>Remix original ↗</button></div>
        </> : <div className="studio-empty"><div className="studio-spark" aria-hidden="true">✷</div><strong>From “hello” to “whoa.”</strong><p>A clay pal, a fuzzy friend, or something<br/>from the far side of your imagination.</p><div className="mini-look-tags"><span>Soft & silly</span><span>Fuzzy & real</span><span>Totally bonkers</span></div></div>}
      </div>
    </div>
    <div className="illustration-collection-heading"><h3>Your illustrated adventures <span>{completed.length}</span></h3><button className="text-button" onClick={() => load().catch(error => setError(error.message))} disabled={busy}>Refresh collection ↻</button></div>
    {completed.length > 0 ? <div className="illustration-gallery">{completed.map(record => <button key={record.id} className={selected?.id === record.id ? 'selected' : ''} onClick={() => setSelectedId(record.id)} disabled={busy} aria-label={`Show ${monsterName(record.recipe)}, ${record.look}`} aria-pressed={selected?.id === record.id}><img src={`/api/generations/${record.id}/image`} alt="" loading="lazy"/><strong>{monsterName(record.recipe)}</strong><small>{looks.find(item => item.id === record.look)!.title}</small></button>)}</div> : <p className="collection-empty">Your first illustrated friend starts a whole new collection.</p>}
    <div className="studio-status" role="status" aria-live="polite">{busy ? 'Generating your illustration. Please wait.' : selected ? `${monsterName(selected.recipe)} is ready in ${selected.look} style.` : ''}</div>
  </section>;
}
