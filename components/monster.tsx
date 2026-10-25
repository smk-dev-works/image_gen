import { palettes, type Recipe, type Slot } from '@/lib/recipe';

const outline = '#39332f';
const bodies = [
  'M110 213C88 159 120 104 174 110C200 83 264 104 282 152C309 169 316 221 296 250C312 288 282 333 241 333L157 333C111 335 88 296 105 260C89 246 96 225 110 213Z',
  'M159 129C171 94 228 94 241 129C250 162 258 175 278 201C314 244 319 301 282 324C252 344 147 344 117 324C81 301 86 244 122 201C142 175 150 162 159 129Z',
  'M143 113Q118 100 107 131Q94 162 100 201L100 284Q99 335 148 335L252 335Q301 335 300 284L300 201Q306 162 293 131Q282 100 257 113Q200 96 143 113Z',
  'M125 158C123 125 150 110 174 120C189 96 223 97 236 122C268 111 285 131 279 159L306 289Q314 335 264 335L136 335Q86 335 94 289Z',
];
export function Monster({ recipe, label = 'Your monster', className, id, focus }: { recipe: Recipe; label?: string; className?: string; id?: string; focus?: Slot }) {
  const p = palettes[recipe.palette];
  const { body, eyes, mouth, arms, feet } = recipe.parts;
  const limb = { fill: p.body, stroke: outline, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const eye = (x: number, y: number, r: number, pupil = 0, star = false) => <g key={`${x}-${y}`}>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill="#fffcf4" stroke={outline} strokeWidth="5" />
    {star ? <path d={`M${x} ${y-12}l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z`} fill={outline} /> : <><ellipse cx={x+pupil} cy={y+2} rx={r*.37} ry={r*.46} fill={outline}/><circle cx={x+pupil+3} cy={y-3} r="3" fill="white"/></>}
  </g>;
  return <svg id={id} xmlns="http://www.w3.org/2000/svg" viewBox={focus ? { body: '85 90 230 260', eyes: '118 145 165 100', mouth: '155 233 90 63', arms: '14 126 103 175', feet: '103 307 191 80' }[focus] : '0 0 400 430'} role="img" aria-label={label} className={className}>
    <ellipse display={focus ? 'none' : undefined} cx="200" cy="382" rx="111" ry="13" fill="#39332f" opacity=".08" />
    <g {...limb}>
      {(!focus || focus === 'feet') && feet === 0 && <><path d="M149 308L147 344Q123 342 119 359L119 371Q144 381 174 370L174 313Z" fill={p.shoe}/><path d="M251 308L253 344Q277 342 281 359L281 371Q256 381 226 370L226 313Z" fill={p.shoe}/><path d="M120 362Q145 369 172 360M228 360Q255 369 280 362" fill="none"/></>}
      {(!focus || focus === 'feet') && feet === 1 && <><path d="M149 308L148 346Q121 341 112 363L112 374H177V312ZM251 308L252 346Q279 341 288 363L288 374H223V312Z" fill={p.shoe}/><path d="M114 365H175M225 365H286M143 346L157 350M140 354L155 358M257 346L243 350M260 354L245 358" fill="none" stroke="#fffcf4" strokeWidth="5"/></>}
      {(!focus || focus === 'feet') && feet === 2 && <><path d="M158 311L153 354Q132 350 136 368Q154 376 171 365L176 311ZM242 311L247 354Q268 350 264 368Q246 376 229 365L224 311Z" fill={p.shoe}/></>}
      {(!focus || focus === 'feet') && feet === 3 && <><path d="M150 309L147 346Q105 341 111 366Q123 379 181 365L178 310ZM250 309L253 346Q295 341 289 366Q277 379 219 365L222 310Z" fill={p.shoe}/><path d="M134 356L131 368M266 356L269 368" fill="none"/></>}
      {(!focus || focus === 'arms') && arms === 0 && <><path d="M113 223Q68 218 63 270Q60 291 43 280Q26 273 34 257" fill="none" stroke={outline} strokeWidth="20"/><path d="M113 223Q68 218 63 270Q60 291 43 280Q26 273 34 257" fill="none" stroke={p.body} strokeWidth="9"/><path d="M287 223Q332 218 337 270Q340 291 357 280Q374 273 366 257" fill="none" stroke={outline} strokeWidth="20"/><path d="M287 223Q332 218 337 270Q340 291 357 280Q374 273 366 257" fill="none" stroke={p.body} strokeWidth="9"/></>}
      {(!focus || focus === 'arms') && arms === 1 && <><path d="M113 228Q72 253 55 222Q42 199 39 180L30 168Q27 158 36 158L43 167L39 148Q40 137 48 143L55 164L57 150Q63 139 68 151L68 180Q70 210 97 202Z"/><path d="M285 223Q337 231 338 275Q339 292 325 295L317 287Q312 281 319 276Q322 257 284 252Z"/></>}
      {(!focus || focus === 'arms') && arms === 2 && <><path d="M108 222Q76 213 76 235L69 231Q57 229 62 241L77 255Q87 262 110 249ZM292 222Q324 213 324 235L331 231Q343 229 338 241L323 255Q313 262 290 249Z"/></>}
      {(!focus || focus === 'arms') && arms === 3 && <><path d="M111 224L77 211L67 187Q63 179 57 185L57 200L44 183Q36 178 34 187L45 207L29 200Q18 200 24 210L46 226Q50 243 68 240L109 252Z"/><path d="M289 224L323 211L333 187Q337 179 343 185L343 200L356 183Q364 178 366 187L355 207L371 200Q382 200 376 210L354 226Q350 243 332 240L291 252Z"/></>}
      <path display={focus && focus !== 'body' ? 'none' : undefined} d={bodies[body]} />
      <path display={focus && focus !== 'body' ? 'none' : undefined} d={body === 1 ? 'M171 133Q178 116 193 116' : body === 3 ? 'M143 153Q140 136 156 135' : 'M127 151Q130 133 146 132'} fill="none" stroke={p.light} strokeWidth="10"/>
    </g>
    <g display={focus && focus !== 'eyes' ? 'none' : undefined}>
      {eyes === 0 && eye(200,193,36)}
      {eyes === 1 && <>{eye(165,195,25,4)}{eye(235,195,25,4)}</>}
      {eyes === 2 && <>{eye(151,200,19)}{eye(200,183,22)}{eye(249,200,19)}</>}
      {eyes === 3 && <>{[163,237].map(x=><g key={x}><ellipse cx={x} cy="198" rx="25" ry="28" fill="#fffcf4" stroke={outline} strokeWidth="5"/><path d={`M${x-24} 190Q${x} 181 ${x+24} 190L${x+22} 177Q${x} 158 ${x-22} 178Z`} fill={p.accent}/><path d={`M${x-24} 190Q${x} 181 ${x+24} 190`} fill="none" stroke={outline} strokeWidth="5"/><ellipse cx={x+3} cy="202" rx="8" ry="10" fill={outline}/></g>)}</>}
      {eyes === 4 && <>{eye(163,185,28,-3)}{eye(235,201,21,5)}</>}
      {eyes === 5 && <>{eye(165,195,27,0,true)}{eye(235,195,27,0,true)}</>}
      <ellipse cx="140" cy="240" rx="13" ry="7" fill={p.accent} opacity=".3"/><ellipse cx="260" cy="240" rx="13" ry="7" fill={p.accent} opacity=".3"/>
    </g>
    <g display={focus && focus !== 'mouth' ? 'none' : undefined} stroke={outline} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      {mouth === 0 && <path d="M179 246Q200 270 221 246" fill="none"/>}
      {mouth === 1 && <><path d="M168 242Q200 251 232 242Q231 283 200 283Q169 283 168 242Z" fill="#fffcf4"/><path d="M170 260H230M190 247V281M210 247V281" fill="none" strokeWidth="3"/></>}
      {mouth === 2 && <ellipse cx="200" cy="260" rx="15" ry="20" fill={outline}/>}
      {mouth === 3 && <><path d="M171 245Q200 257 229 245Q224 278 200 278Q176 278 171 245Z" fill={outline}/><path d="M177 248L187 263L193 252M207 252L213 263L223 248" fill="#fffcf4" strokeWidth="3"/></>}
      {mouth === 4 && <><path d="M176 247Q200 268 224 247" fill="none"/><path d="M200 259L200 274Q213 290 223 274L223 250" fill="#ef8e9a"/><path d="M211 261V272" fill="none" strokeWidth="3"/></>}
      {mouth === 5 && <path d="M173 253Q182 240 192 253T211 253T230 253" fill="none"/>}
    </g>
    <g display={focus && focus !== 'body' ? 'none' : undefined} fill={p.accent} opacity=".38"><circle cx="135" cy="289" r="5"/><circle cx="146" cy="302" r="3"/><circle cx="262" cy="285" r="4"/></g>
  </svg>;
}
