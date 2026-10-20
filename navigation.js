'use strict';
window.createLearningNavigation = function (selectChapter, currentChapter) {
  const $ = id => document.getElementById(id);
  const exercises = [
    ['scenario-lab','Scenario Lab','Choose the right cryptographic tool.',false],
    ['kem-prediction','Predict Before Reveal','Predict who learns a secret and when.',true],
    ['double-encapsulation','Two Encapsulations','Compare two pairs created with the same public key.',true],
    ['message-journey','Message Journey','Follow identity, key derivation and a verified message.',false],
    ['key-substitution-story','Key Substitution Story','Separate the intended peer from the actual key owner.',true],
    ['attack-playground','Attack Playground','Test modification, substitution, replay and delivery.',false],
    ['build-the-wire','Build the Wire','Observe how transmitting a secret changes Eve’s knowledge.',true],
    ['protocol-repair','Find the Missing Protection','Repair the missing protocol role.',true],
    ['guided-missions','Guided Missions','Demonstrate the behavior and explain the result.',false],
    ['teach-it-back','Teach It Back','Summarize the evidence in your own words.',true]
  ];
  const wrappers = new Map();let active=null,routing=false;
  const node=(tag,text)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;};
  function sync(){
    const index=exercises.findIndex(([id])=>id===active);
    $('exercise-current').textContent=index<0?'Choose an exercise, or follow the recommended path.':`EXERCISE ${index+1} / ${exercises.length} · ${exercises[index][1]}`;
    $('exercise-prev').disabled=index<=0;$('exercise-next').disabled=index<0||index===exercises.length-1;
  }
  function reveal(section,updateUrl=false){
    const element=$(section);if(!element)return false;
    const wrapper=element.closest('[data-exercise-panel]');
    if(!wrapper){
      if(updateUrl){wrappers.forEach(panel=>{panel.open=false;});active=null;sync();if(location.hash!==`#${section}`)history.replaceState(null,'',`#${section}`);}
      return false;
    }
    const entry=exercises.find(([id])=>id===wrapper.dataset.exercisePanel);
    if(entry[3]&&currentChapter()!==3){routing=true;try{selectChapter(3);}finally{routing=false;}}
    wrappers.forEach(other=>{other.open=other===wrapper;});
    for(let ancestor=element;ancestor&&ancestor!==wrapper;ancestor=ancestor.parentElement){if(ancestor.tagName==='DETAILS')ancestor.open=true;}
    // Only an explicit open updates the picker; delayed toggle events must not overwrite a learner's selection.
    active=entry[0];$('exercise-picker').value=active;sync();
    if(updateUrl&&location.hash!==`#${section}`)history.replaceState(null,'',`#${section}`);
    return true;
  }
  function open(section,updateUrl=true){
    if(!reveal(section))return;
    if(updateUrl&&location.hash!==`#${section}`)history.pushState(null,'',`#${section}`);
    focusSection($(section));
  }
  function focusSection(target){
    target.scrollIntoView({block:'start'});
    const focusTarget=target.matches(':disabled')?target.closest('section')||target:target;
    if(focusTarget.tabIndex<0&&!focusTarget.hasAttribute('tabindex'))focusTarget.setAttribute('tabindex','-1');
    focusTarget.focus({preventScroll:true});
  }
  exercises.forEach(([id,title,description],index)=>{
    const section=$(id),wrapper=node('details'),summary=node('summary'),heading=node('span',`${index+1}. ${title}`),hint=node('span',description);
    wrapper.className='exercise-panel';wrapper.dataset.exercisePanel=id;summary.append(heading,hint);section.before(wrapper);wrapper.append(summary,section);
    const footer=node('nav');footer.className='exercise-footer';footer.setAttribute('aria-label',`${title} navigation`);
    const previous=node('button','← Previous exercise'),menu=node('button','Back to exercise menu'),next=node('button','Next exercise →');
    previous.disabled=index===0;next.disabled=index===exercises.length-1;
    previous.onclick=()=>open(exercises[index-1][0]);next.onclick=()=>open(exercises[index+1][0]);
    menu.onclick=()=>{$('exercise-navigation').scrollIntoView({block:'start'});$('exercise-picker').focus({preventScroll:true});};
    footer.append(previous,menu,next);wrapper.append(footer);wrappers.set(id,wrapper);
    summary.addEventListener('click',event=>{
      event.preventDefault();
      if(!wrapper.open){open(id);return;}
      wrapper.open=false;
      let target;try{target=$(decodeURIComponent(location.hash.slice(1)));}catch{}
      if(target?.closest('[data-exercise-panel]')===wrapper){const url=new URL(location.href);url.hash='';history.replaceState(null,'',url.href);}
    });
    wrapper.addEventListener('toggle',()=>{
      if(wrapper.open){if(exercises[index][3]&&currentChapter()!==3)selectChapter(3);wrappers.forEach(other=>{if(other!==wrapper)other.open=false;});active=id;sync();}
      else if(active===id){active=null;sync();}
    });
    const option=node('option',`${index+1}. ${title}`);option.value=id;$('exercise-picker').append(option);
    const item=node('li'),button=node('button',title),note=node('p',description);button.dataset.routeExercise=id;button.onclick=()=>open(id);item.append(button,note);$('exercise-path').append(item);
  });
  $('exercise-open').onclick=()=>open($('exercise-picker').value);
  $('exercise-prev').onclick=()=>{const index=exercises.findIndex(([id])=>id===active);if(index>0)open(exercises[index-1][0]);};
  $('exercise-next').onclick=()=>{const index=exercises.findIndex(([id])=>id===active);if(index>=0&&index<exercises.length-1)open(exercises[index+1][0]);};
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href^="#"]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;const section=link.getAttribute('href').slice(1);
    if($(section)?.closest('[data-exercise-panel]')){event.preventDefault();open(section);}
  });
  function openHash(restoreMenu=false){
    let section;try{section=decodeURIComponent(location.hash.slice(1));}catch{return;}
    if(section){
      const target=$(section);if(!target)return;
      if(target.closest('[data-exercise-panel]')){open(section,false);return;}
      wrappers.forEach(wrapper=>{wrapper.open=false;});active=null;sync();
      if(restoreMenu)focusSection(target);
      return;
    }
    wrappers.forEach(wrapper=>{wrapper.open=false;});active=null;sync();
    if(restoreMenu){$('exercise-navigation').scrollIntoView({block:'start'});$('exercise-picker').focus({preventScroll:true});}
  }
  window.addEventListener('hashchange',()=>openHash(true));
  window.addEventListener('popstate',()=>{
    const requested=Number(new URLSearchParams(location.search).get('chapter'));
    const index=Number.isInteger(requested)&&requested>=1&&requested<=6?requested-1:0;
    if(currentChapter()!==index){routing=true;try{selectChapter(index);}finally{routing=false;}}
    openHash(true);
  });
  window.revealLearningSection=reveal;
  sync();
  function chapterChanged(index, remember) {
    if (remember) {
      const url=new URL(location.href);url.searchParams.set('chapter',String(index+1));
      let target;try{target=$(decodeURIComponent(location.hash.slice(1)));}catch{}
      if(!routing&&target?.closest('[data-exercise-panel]'))url.hash='';
      if(url.href!==location.href)history.replaceState(null,'',url.href);
    }
    if (active && exercises.find(([id]) => id === active)[3] && index !== 3) {
      wrappers.get(active).open = false;
      active = null;
      sync();
    }
  }
  return {openHash, chapterChanged};
};
