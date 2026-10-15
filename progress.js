'use strict';
window.completeLearning = id => window.dispatchEvent(new CustomEvent('pqlab:completion', { detail: { id } }));
window.createLearningProgress = function (selectChapter) {
  const $ = id => document.getElementById(id), key = 'post-quantum-lab.progress.v1';
  const entries = window.LESSONS.map((lesson,index) => ({ id:`chapter-${index}`, label:`Chapter ${index+1}: ${lesson.name}`, chapter:index, section:'lesson-title' }));
  const add = (id,label,section,chapter=3) => entries.push({id,label,section,chapter});
  for(let i=0;i<3;i++)add(`scenario-${i}`,`Scenario ${i+1}`,'scenario-lab');
  for(let i=0;i<3;i++)add(`mission-${i}`,`Guided mission ${i+1}`,'guided-missions');
  [['untrusted-blocked','Block a substituted key'],['tamper-rejected','Reject a modified packet'],['drop-observed','Observe a dropped packet'],['replay-unguarded','Observe replay without freshness'],['replay-guarded','Reject replay with freshness']].forEach(([id,label])=>add(id,label,'attack-playground'));
  add('journey','Verify a message journey','message-journey'); add('aes','AES-GCM round trip','interaction',4);
  add('predictions','Three correct KEM predictions','kem-prediction');add('double','Explain independent encapsulations','double-encapsulation');add('substitution','Explain key substitution','key-substitution-story');add('wire','Build a public-only wire','build-the-wire');
  for(let i=0;i<4;i++)add(`repair-${i}`,`Protocol repair ${i+1}`,'protocol-repair');
  for(let i=0;i<3;i++)add(`teach-${i}`,`Teach It Back ${i+1}`,'teach-it-back');
  const ids = new Set(entries.map(entry=>entry.id)), sections = new Set(entries.map(entry=>entry.section));
  const scoped = new Set(['kem-prediction','double-encapsulation','key-substitution-story','build-the-wire','protocol-repair','teach-it-back']);
  const empty = () => ({version:1,completed:[],last:{chapter:0,section:'lesson-title'}});
  let state=empty(),persistent=true,currentChapter=0;
  function decode(raw) {
    try {
      if(!raw||raw.length>20000)return empty();const data=JSON.parse(raw);
      if(data?.version!==1||!Array.isArray(data.completed))return empty();
      const chapter=Number.isInteger(data.last?.chapter)&&data.last.chapter>=0&&data.last.chapter<6?data.last.chapter:0;
      const section=sections.has(data.last?.section)?data.last.section:'lesson-title';
      return {version:1,completed:[...new Set(data.completed.filter(id=>ids.has(id)))],last:{chapter:scoped.has(section)?3:section==='interaction'?4:chapter,section}};
    }catch{return empty();}
  }
  try{state=decode(localStorage.getItem(key));}catch{persistent=false;}
  function save(){if(persistent)try{localStorage.setItem(key,JSON.stringify(state));}catch{persistent=false;}render();}
  function visit(section,chapter=currentChapter){if(!sections.has(section))return;if(state.last.section===section&&state.last.chapter===chapter)return;state.last={chapter,section};save();}
  function go(target){const location={...target};selectChapter(location.chapter);window.revealLearningSection?.(location.section);const element=$(location.section);if(element){element.scrollIntoView({block:'start'});element.setAttribute('tabindex','-1');element.focus({preventScroll:true});}visit(location.section,location.chapter);}
  function complete(id){if(!ids.has(id)||state.completed.includes(id))return;state.completed.push(id);save();}
  function render(){
    const chapters=state.completed.filter(id=>id.startsWith('chapter-')).length;
    $('learning-summary').textContent=`${chapters} / 6 chapters · ${state.completed.length-chapters} / ${entries.length-6} exercise milestones completed`;
    $('learning-meter').max=entries.length;$('learning-meter').value=state.completed.length;
    $('learning-storage').textContent=persistent?'Saved in this browser only. No account; no messages, keys, ciphertext or notes are stored.':'Storage is unavailable. New progress is session-only until this page closes.';
    const labels={'scenario-lab':'Scenario Lab','guided-missions':'Guided Missions','attack-playground':'Attack Playground','message-journey':'Message Journey','interaction':'AES-GCM demo','kem-prediction':'Predict Before Reveal','double-encapsulation':'Two Encapsulations','key-substitution-story':'Key Substitution Story','build-the-wire':'Build the Wire','protocol-repair':'Find the Missing Protection','teach-it-back':'Teach It Back'};
    $('learning-resume-label').textContent=`Last location: ${state.last.section==='lesson-title'?entries[state.last.chapter].label:labels[state.last.section]||'Learning exercise'}. Experiments restart with fresh state.`;
    $('learning-checklist').replaceChildren(...entries.map(entry=>{const li=document.createElement('li'),button=document.createElement('button');button.textContent=`${state.completed.includes(entry.id)?'✓ Completed':'○ Not completed'} · ${entry.label}`;button.dataset.progressId=entry.id;button.onclick=()=>go(entry);li.append(button);return li;}));
    document.querySelectorAll('[data-chapter]').forEach(button=>{const index=Number(button.dataset.chapter),done=state.completed.includes(`chapter-${index}`);button.dataset.completed=String(done);button.setAttribute('aria-label',`${entries[index].label}${done?' · completed':''}`);});
  }
  sections.forEach(section=>{const element=$(section);if(element)element.dataset.progressSection=section;});
  document.querySelector('.explorer').dataset.progressSection='lesson-title';
  document.addEventListener('focusin',event=>{const section=event.target.closest('[data-progress-section]')?.dataset.progressSection;if(section)visit(section==='interaction'&&currentChapter!==4?'lesson-title':section);});
  window.addEventListener('pqlab:completion',event=>complete(event.detail?.id));
  window.addEventListener('pqlab:activity',event=>{const type=event.detail?.type;if(type==='verified')complete('journey');else if(['untrusted-blocked','tamper-rejected','drop-observed','replay-unguarded','replay-guarded'].includes(type))complete(type);});
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null){state=decode(event.newValue);render();}});
  $('learning-continue').onclick=()=>go(state.last);
  $('learning-clear').onclick=()=>{state=empty();try{localStorage.removeItem(key);}catch{persistent=false;}render();};
  render();
  return {chapterChanged(index,remember=true){currentChapter=index;if(remember)visit('lesson-title',index);else render();},rememberRoute(index){if(state.last.chapter!==index)visit('lesson-title',index);}};
};
