'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Monster } from './monster';
import { IllustrationStudio } from './illustration-studio';
import { Icon } from './icons';
import { catalog, initialRecipe, slots, palettes, rollRecipe, createRecipe, monsterName, recipeKey, type Slot, type Recipe, type Favorite } from '@/lib/recipe';
import { decodeState, STORAGE_KEY } from '@/lib/storage';
import { revealMonster } from '@/lib/motion';

const slotTitles: Record<Slot, string> = { body: 'Body', eyes: 'Eyes', mouth: 'Mouth', arms: 'Arms', feet: 'Feet' };
function freshSeed() { return crypto.getRandomValues(new Uint32Array(1))[0]; }

export function Mixer() {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const rollStarted = useRef<number | null>(null);
  const name = monsterName(recipe);
  const allLocked = slots.every(s => recipe.locks[s]);
  const saved = favorites.some(f => f.id === recipeKey(recipe));

  useEffect(() => {
    try {
      const state = decodeState(localStorage.getItem(STORAGE_KEY));
      if (state) { setRecipe(state.recipe); setFavorites(state.favorites); }
    } catch { setStorageError(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ recipe, favorites })); setStorageError(false); }
    catch { setStorageError(true); }
  }, [recipe, favorites, ready]);

  // DOM-only timing marker lets QA measure recipe-to-commit latency without network/tool overhead.
  useLayoutEffect(() => {
    if (rollStarted.current !== null && stageRef.current) {
      stageRef.current.dataset.renderMs = (performance.now() - rollStarted.current).toFixed(2);
      rollStarted.current = null;
    }
  }, [recipe]);

  function animate() {
    revealMonster(stageRef.current, matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function roll(only?: Slot) {
    rollStarted.current = performance.now();
    const next = rollRecipe(recipe, freshSeed(), only);
    setRecipe(next); animate();
    setAnnouncement(only ? `${slotTitles[only]} remixed: ${catalog[only][next.parts[only]]}.` : `Meet ${monsterName(next)}!${slots.some(slot => recipe.locks[slot]) ? ' Your locked features stayed put.' : ''}`);
  }
  function toggleLock(slot: Slot) {
    const locked = !recipe.locks[slot];
    setRecipe(r => ({ ...r, locks: { ...r.locks, [slot]: locked } }));
    setAnnouncement(`${slotTitles[slot]} ${locked ? 'locked. It will stay when you roll.' : 'unlocked.'}`);
  }
  function save() {
    if (saved) return;
    if (favorites.length >= 12) { setAnnouncement('Your shelf is full. Remove a favorite to make room for a new friend.'); return; }
    setFavorites(f => [...f, { id: recipeKey(recipe), name, recipe: structuredClone(recipe) }]);
    setAnnouncement(`${name} added to your favorites.`);
  }
  function reset() {
    const next = createRecipe(freshSeed());
    setRecipe(next); animate();
    setAnnouncement('Fresh start! All features unlocked, with a new palette and monster.');
  }
  async function download() {
    setExporting(true);
    let sourceUrl: string | undefined;
    let downloadUrl: string | undefined;
    try {
      const svg = document.getElementById('monster-export');
      if (!svg) throw new Error('Missing monster');
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute('width', '1200'); clone.setAttribute('height', '1290');
      sourceUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = sourceUrl!; });
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 1290;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#fbf8f0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Export failed')), 'image/png'));
      downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${name.toLowerCase().replaceAll(' ', '-')}.png`; link.href = downloadUrl;
      document.body.appendChild(link); link.click(); link.remove();
      setAnnouncement(`${name} downloaded as a PNG. Say hello to your new friend!`);
    } catch { setAnnouncement('The PNG could not be downloaded. Please try again.'); }
    finally {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (downloadUrl) { const url = downloadUrl; setTimeout(() => URL.revokeObjectURL(url), 10000); }
      setExporting(false);
    }
  }

  return <main>
    <header className="header">
      <a href="/" className="brand" aria-label="Monster Mixer home"><span className="brand-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M8 17Q4 5 15 8Q21 1 27 9Q38 7 33 21Q38 35 25 33Q17 39 11 32Q0 31 8 17Z" fill="#c7db87" stroke="currentColor" strokeWidth="2.5"/><circle cx="15" cy="19" r="2" fill="currentColor"/><circle cx="25" cy="19" r="2" fill="currentColor"/><path d="M16 25q4 4 8 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></span>monster<span className="brand-light">mixer</span><span className="brand-dot" aria-hidden="true">✳</span></a>
      <div className="header-note"><span className="status-dot"/> A LITTLE WEIRD. A LOT OF YOU.</div>
      <span className="lab-label">THE MONSTER LAB <span>001</span></span>
    </header>

    <section className="intro"><div><p className="eyebrow">HAPPY LITTLE ACCIDENTS, MADE BY YOU</p><h1>Oh, the <span>possibilities.</span><svg viewBox="0 0 282 12" aria-hidden="true"><path d="M4 8Q130-2 278 6" fill="none" stroke="#b6cd7a" strokeWidth="6" strokeLinecap="round"/></svg></h1><p>Roll a little weirdo. Keep the bits you love. See who turns up next.</p></div><div className="intro-doodle" aria-hidden="true"><svg viewBox="0 0 110 70"><path d="M15 37Q55 69 85 21M65 21l22-4-1 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg><span>no two quite alike</span></div></section>

    <div className="workspace">
      <section className="stage-card" aria-label="Monster preview">
        <div className="stage-top"><span className="template-pill"><span/> BLOB COLLECTION</span><button className="text-button reset" onClick={reset} disabled={!ready}><Icon name="reset" size={15}/> Fresh start</button></div>
        <div className="character-area">
          <span className="stage-star star-one" aria-hidden="true">✳</span><span className="stage-star star-two" aria-hidden="true">✧</span>
          <span className="handwritten stage-note" aria-hidden="true">100% lovable.<br/>probably.</span>
          <div ref={stageRef} className="monster-wrap"><Monster recipe={recipe} id="monster-export" label={`${name}, a ${catalog.body[recipe.parts.body].toLowerCase()} monster with ${catalog.eyes[recipe.parts.eyes].toLowerCase()}, ${catalog.mouth[recipe.parts.mouth].toLowerCase()}, ${catalog.arms[recipe.parts.arms].toLowerCase()}, and ${catalog.feet[recipe.parts.feet].toLowerCase()}.`}/></div>
          <div className="character-caption"><span>MEET YOUR NEW FRIEND</span><h2>{name}</h2><p>A little odd. Just like the best of us.</p></div>
        </div>
        <div className="stage-actions"><button className="roll-button" onClick={() => roll()} disabled={!ready || allLocked}><Icon name="shuffle" size={23}/>{allLocked ? 'All bits locked' : 'Roll a monster'}<span aria-hidden="true">↗</span></button><div className="secondary-actions"><button className={`save-button ${saved ? 'is-saved' : ''}`} onClick={save} disabled={!ready || saved || favorites.length >= 12}><Icon name={saved ? 'check' : 'heart'} size={19}/>{saved ? 'Saved to favorites' : favorites.length >= 12 ? 'Favorites full (12)' : 'Save favorite'}</button><span className="action-divider"/><button className="download-button" onClick={download} disabled={!ready || exporting}><Icon name="download" size={19}/>{exporting ? 'Preparing…' : 'Download PNG'}</button></div><p className="roll-hint">{allLocked ? 'Unlock a feature to keep mixing.' : 'A fresh little surprise with every roll.'}</p></div>
      </section>

      <aside className="controls" aria-label="Monster controls">
        <div className="controls-heading"><div className="section-kicker"><Icon name="spark" size={15}/> THE FUN IS IN THE DETAILS</div><h2>Make it <em>yours.</em></h2><p>Love a bit? Lock it. Remix the rest.</p></div>
        <div className="feature-list">{slots.map(slot => <div key={slot} className={`feature-row ${recipe.locks[slot] ? 'locked' : ''}`}>
          <button className={`feature-reroll feature-${slot}`} onClick={() => roll(slot)} disabled={!ready || recipe.locks[slot]} aria-label={`Reroll ${slotTitles[slot].toLowerCase()}: ${catalog[slot][recipe.parts[slot]]}`}><span className="feature-picture"><Monster recipe={recipe} focus={slot}/></span><span className="feature-copy"><span className="feature-label">{slotTitles[slot]}</span><span className="feature-name">{catalog[slot][recipe.parts[slot]]}</span></span><Icon name="shuffle" size={16}/></button>
          <button className="lock-button" onClick={() => toggleLock(slot)} disabled={!ready} aria-label={`${recipe.locks[slot] ? 'Unlock' : 'Lock'} ${slotTitles[slot].toLowerCase()}`} aria-pressed={recipe.locks[slot]} title={recipe.locks[slot] ? 'Keep this bit' : 'Lock this bit'}><Icon name={recipe.locks[slot] ? 'lock' : 'unlock'} size={18}/></button>
        </div>)}</div>
        <div className="palette-section"><div className="palette-label"><span>A splash of color</span><span>{palettes[recipe.palette].name}</span></div><div className="palettes" role="group" aria-label="Color palette">{palettes.map((palette, i) => <button key={palette.name} style={{ '--swatch': palette.body } as React.CSSProperties} className={`swatch ${i === recipe.palette ? 'selected' : ''}`} aria-label={palette.name} aria-pressed={i === recipe.palette} disabled={!ready} onClick={() => { setRecipe(r => ({ ...r, palette: i })); setAnnouncement(`Palette changed to ${palette.name}.`); }} title={palette.name}>{i === recipe.palette && <Icon name="check" size={19}/>}</button>)}</div></div>
        <div className="tip"><span className="tip-icon"><Icon name="lock" size={18}/></span><p><strong>A keeper of a feature?</strong><br/>The little lock makes it stay, even when everything else changes.</p></div>
      </aside>
    </div>

    <IllustrationStudio recipe={recipe} onRemix={next => { setRecipe(next); animate(); setAnnouncement(`${monsterName(next)} is back from your illustration collection.`); }}/>

    <section className="favorites-section" aria-label="Saved favorites"><div className="favorites-heading"><div><Icon name="heart" size={20}/><h2>Your little collection</h2><span className="count">{favorites.length}/12</span></div><p>Good weirdos deserve a place to stay.</p></div>
      {favorites.length === 0 ? <div className="empty-shelf"><span className="empty-heart"><Icon name="heart" size={23}/></span><p><strong>Someone special will land here.</strong><span>Save a favorite and start your collection.</span></p><span className="shelf-doodle" aria-hidden="true">your kind of weird ↗</span></div> : <div className="favorites-grid">{favorites.map(favorite => <div className={`favorite-card ${favorite.id === recipeKey(recipe) ? 'current' : ''}`} key={favorite.id}><button className="favorite-load" onClick={() => { setRecipe(structuredClone(favorite.recipe)); setAnnouncement(`${favorite.name} is back, exactly as you saved them.`); animate(); }} aria-label={`Load ${favorite.name}`}><Monster recipe={favorite.recipe} label={favorite.name}/><span>{favorite.name}</span><small>{favorite.id === recipeKey(recipe) ? 'ON THE STAGE' : 'BRING ME BACK'}</small></button><button className="favorite-remove" aria-label={`Remove ${favorite.name}`} onClick={() => { setFavorites(f => f.filter(item => item.id !== favorite.id)); setAnnouncement(`${favorite.name} removed from favorites.`); }}><Icon name="close" size={14}/></button></div>)}</div>}
    </section>
    <div className="feedback" role="status" aria-live="polite" aria-atomic="true">{announcement || 'Your next favorite monster is one roll away.'}</div>
    {storageError && <p className="storage-warning" role="alert">Your browser couldn’t save this session. Download your monster to keep it, or enable browser storage.</p>}
    <footer><span>Made for the joy of making something.</span><span><span className="status-dot"/> INSTANT MIXING. OPTIONAL AI MAGIC.</span><span>STAY A LITTLE STRANGE <span aria-hidden="true">✳</span></span></footer>
  </main>;
}
