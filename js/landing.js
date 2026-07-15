(() => {
  const reveals = [...document.querySelectorAll('.reveal')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  const conclusion = document.querySelector('.landing-conclusion');
  if (conclusion) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      conclusion.classList.add('is-sequenced');
    } else {
      const conclusionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          conclusion.classList.add('is-sequenced');
          conclusionObserver.disconnect();
        });
      }, { threshold: 0.28 });
      conclusionObserver.observe(conclusion);
    }
  }

  const demo = document.querySelector('[data-edw-demo]');
  if (!demo) return;

  const sourceData = {
    ipms: {
      label: 'IPMS', title: 'Country field standardization', field: 'office_country',
      values: ['UAE', 'United Arab Emirates', 'AE', 'Dubai Office'],
      note: 'Four values describe the same business entity.',
      outputCode: 'AE', outputLabel: 'United Arab Emirates', confidence: '98%',
      lineage: 'IPMS.office_country', published: 'edw.clients.country_code'
    },
    finance: {
      label: 'Finance', title: 'Payment status reconciliation', field: 'payment_status',
      values: ['Paid', 'Settled', 'Allocated', 'Closed'],
      note: 'Statuses differ across operational and accounting workflows.',
      outputCode: 'SET', outputLabel: 'Settled and allocated', confidence: '96%',
      lineage: 'Finance.payment_status', published: 'edw.billings.settlement_status'
    },
    tariff: {
      label: 'Tariff Tool', title: 'Client pricing normalization', field: 'client_pricelist',
      values: ['Special A', 'Client rate', 'Agreed tariff', 'Office exception'],
      note: 'Pricing labels require one governed commercial classification.',
      outputCode: 'SPA', outputLabel: 'Special pricing arrangement', confidence: '94%',
      lineage: 'Tariff.client_pricelist', published: 'edw.clients.pricing_type'
    },
    office: {
      label: 'Office Files', title: 'Office identity matching', field: 'office_name',
      values: ['Dubai', 'UAE Office', 'AE', 'Saba UAE'],
      note: 'Local office labels must resolve to one enterprise identifier.',
      outputCode: 'AE', outputLabel: 'United Arab Emirates office', confidence: '97%',
      lineage: 'OfficeFiles.office_name', published: 'edw.offices.office_code'
    }
  };

  const q = selector => demo.querySelector(selector);
  const qa = selector => [...demo.querySelectorAll(selector)];
  let current = sourceData.ipms;
  let running = false;

  const resetState = ({ resetButton = true } = {}) => {
    qa('.governance-step').forEach((step, index) => {
      step.classList.remove('is-active', 'is-complete');
      step.classList.toggle('is-ready', index === 0);
      step.querySelector('i').textContent = index === 0 ? 'Ready' : 'Queued';
    });
    q('[data-validation]').textContent = '—';
    q('[data-confidence]').textContent = '—';
    q('[data-lineage]').textContent = 'Pending';
    const status = q('[data-trust-status]');
    status.classList.remove('is-trusted');
    status.lastChild.textContent = 'Awaiting governance flow';
    if (resetButton) {
      const button = q('[data-run-transform]');
      button.querySelector('span').textContent = 'Run governance flow';
      button.disabled = false;
      demo.classList.remove('is-running');
    }
  };

  const renderSource = data => {
    current = data;
    q('[data-demo-title]').textContent = data.title;
    q('[data-source-label]').textContent = data.label;
    q('[data-source-field]').textContent = data.field;
    q('[data-quality-note]').textContent = data.note;
    q('[data-output-code]').textContent = data.outputCode;
    q('[data-output-label]').textContent = data.outputLabel;
    q('[data-lineage-path]').textContent = data.lineage;
    q('[data-published-field]').textContent = data.published;
    const container = q('[data-raw-values]');
    container.innerHTML = data.values.map((value, i) => `<button type="button" class="raw-value${i === 0 ? ' is-selected' : ''}">${value}</button>`).join('');
    resetState();
  };

  qa('.source-item').forEach(button => {
    button.addEventListener('click', () => {
      if (running) return;
      qa('.source-item').forEach(item => item.classList.toggle('is-active', item === button));
      renderSource(sourceData[button.dataset.source]);
    });
  });

  demo.addEventListener('click', event => {
    const raw = event.target.closest('.raw-value');
    if (!raw) return;
    qa('.raw-value').forEach(item => item.classList.toggle('is-selected', item === raw));
  });

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  q('[data-run-transform]').addEventListener('click', async event => {
    if (running) return;
    running = true;
    const button = event.currentTarget;
    button.disabled = true;
    button.querySelector('span').textContent = 'Running controls';
    demo.classList.add('is-running');
    resetState({ resetButton: false });

    const steps = qa('.governance-step');
    for (let i = 0; i < steps.length; i += 1) {
      steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === i);
        step.classList.remove('is-ready');
      });
      steps[i].querySelector('i').textContent = 'Running';
      await wait(reducedMotion ? 20 : 720);
      steps[i].classList.remove('is-active');
      steps[i].classList.add('is-complete');
      steps[i].querySelector('i').textContent = 'Passed';
      await wait(reducedMotion ? 10 : 220);
    }

    q('[data-validation]').textContent = '100%';
    q('[data-confidence]').textContent = current.confidence;
    q('[data-lineage]').textContent = 'Verified';
    const status = q('[data-trust-status]');
    status.classList.add('is-trusted');
    status.lastChild.textContent = 'Trusted for analytical use';
    demo.classList.remove('is-running');
    button.querySelector('span').textContent = 'Run again';
    button.disabled = false;
    running = false;
  });

  const epmDemo = document.querySelector('[data-epm-demo]');
  if (epmDemo) {
    const eq = selector => epmDemo.querySelector(selector);
    const eqa = selector => [...epmDemo.querySelectorAll(selector)];
    const steps = [
      {
        title:'Connect to EDW', success:'Connected successfully', basis:'Connected to EDW',
        body:`<div class="stage-section-label">Governed datasets</div><div class="connected-datasets" aria-label="Governed datasets"><div class="dataset-card"><span>Governed dataset</span><b>edw.billings</b><small>Revenue, collections and billing history</small></div><div class="dataset-card"><span>Governed dataset</span><b>edw.clients</b><small>Client master and relationship attributes</small></div><div class="dataset-card"><span>Governed dataset</span><b>edw.jobs</b><small>Instructions, workload and operational activity</small></div></div><div class="stage-checks"><span>Required datasets connected</span><span>Checkpoint selected</span><span>Reference objects available</span></div>`
      },
      {
        title:'Run smoke tests', success:'Passed', basis:'Reporting objects ready',
        body:`<div class="stage-section-label">Readiness checks</div><div class="stage-checks"><span>Required objects present</span><span>Expected fields available</span><span>Checkpoint objects ready</span></div><div class="stage-checks"><span>Reference tables loaded</span><span>Calculation inputs available</span><span>Output destination ready</span></div>`
      },
      {
        title:'Calculate KPIs', success:'Calculated successfully', basis:'Business KPIs calculated',
        body:`<div class="stage-section-label">Business performance domains</div><div class="kpi-build-list"><div><b>Revenue</b><span>Gross Revenue<br>Collections</span></div><div><b>Clients</b><span>Active · New · Retention<br>Local vs International</span></div><div><b>Operations</b><span>Work Demand · Backlog<br>Turnaround Time</span></div></div>`
      },
      {
        title:'Compare benchmarks', success:'Compared successfully', basis:'Historical context applied',
        body:`<div class="stage-section-label">Benchmark context</div><div class="cycle-bars"><div class="cycle-bar"><span>Revenue momentum</span><i style="--w:78%"></i><b>Above</b></div><div class="cycle-bar"><span>Client health</span><i style="--w:66%"></i><b>Stable</b></div><div class="cycle-bar"><span>Operations</span><i style="--w:54%"></i><b>Mixed</b></div></div>`
      },
      {
        title:'Identify variances', success:'Variances identified', basis:'Attention signals ready',
        body:`<div class="stage-section-label">Performance signals</div><div class="kpi-build-list variance-groups"><div><b>Positive movement</b><span>Revenue direction<br>Client retention</span></div><div><b>Within expected range</b><span>Collections performance<br>Client mix</span></div><div><b>Requires attention</b><span>New-client momentum<br>Selected operational signals</span></div></div>`
      },
      {
        title:'View performance results', success:'Business results available', basis:'Performance results available',
        body:`<div class="governed-output epm-results-output"><div class="governed-output-head"><span class="status-dot"></span><div><span>Business performance</span><b>Monthly Group Performance Results</b><small>Published · decision-ready performance view</small></div><em>Decision ready</em></div><div class="epm-results-domains"><article><h4>Revenue</h4><dl><div><dt>Gross Revenue</dt><dd><span class="metric-restricted">Restricted</span><span class="kpi-indicator is-positive">▲ 6.4%</span></dd></div><div><dt>Collections</dt><dd><span class="metric-restricted">Restricted</span><span class="kpi-indicator is-within">● Within range</span></dd></div></dl></article><article><h4>Clients</h4><dl><div><dt>Active</dt><dd><span class="metric-restricted">Restricted</span><span class="kpi-indicator is-positive">▲ 1.8%</span></dd></div><div><dt>New</dt><dd><span class="metric-restricted">Restricted</span><span class="kpi-indicator is-negative">▼ 2.4%</span></dd></div><div><dt>Retention</dt><dd><span>96.4%</span><span class="kpi-indicator is-positive">▲ 0.7%</span></dd></div><div><dt>Local / International</dt><dd><span>6% / 94%</span><span class="kpi-indicator is-within">● Stable</span></dd></div></dl></article><article><h4>Operations</h4><dl><div><dt>Work Demand</dt><dd><span class="metric-restricted">Restricted</span><span class="kpi-indicator is-positive">▲ 4.6%</span></dd></div><div><dt>Backlog</dt><dd><span class="metric-restricted">Restricted</span><span class="kpi-indicator is-positive">▼ 12.4%</span></dd></div><div><dt>Turnaround Time</dt><dd><span class="kpi-indicator is-positive">▼ 8.1%</span></dd></div></dl></article></div></div>`
      }
    ];
    let running = false;
    let cycleComplete = false;
    let activeIndex = 0;
    const completedSteps = new Set();

    const lockedBody = index => index === 0
      ? `<div class="stage-section-label">Governed datasets</div><div class="connected-datasets" aria-label="Governed datasets"><div class="dataset-card"><span>Governed dataset</span><b>edw.billings</b><small>Revenue, collections and billing history</small></div><div class="dataset-card"><span>Governed dataset</span><b>edw.clients</b><small>Client master and relationship attributes</small></div><div class="dataset-card"><span>Governed dataset</span><b>edw.jobs</b><small>Instructions, workload and operational activity</small></div></div>`
      : `<div class="stage-empty"><span>${String(index + 1).padStart(2,'0')}</span><b>${steps[index].title}</b><small>Run the performance cycle to complete this stage.</small></div>`;

    const renderStage = (index, mode = 'inspect') => {
      activeIndex = index;
      const step = steps[index];
      const isCurrentRunning = running && mode === 'running';
      const isComplete = completedSteps.has(index);
      eqa('[data-cycle-step]').forEach((item,i) => {
        item.classList.toggle('is-active', i === index);
        item.classList.toggle('is-complete', completedSteps.has(i));
      });
      eq('[data-stage-label]').textContent = `Stage ${index + 1} of ${steps.length}`;
      eq('[data-stage-title]').textContent = step.title;
      eq('[data-epm-basis]').textContent = isCurrentRunning ? `Running stage ${index + 1} of ${steps.length}` : (cycleComplete ? 'Performance cycle complete' : 'Ready to run');
      const status = eq('[data-stage-status]');
      const caption = eq('[data-stage-caption]');
      const body = eq('[data-stage-body]');
      const stage = eq('[data-cycle-stage]');
      stage.classList.toggle('is-running', isCurrentRunning);
      stage.classList.toggle('is-complete', isComplete);
      if (isCurrentRunning) {
        status.textContent = 'Running';
        caption.textContent = 'This stage is being completed now.';
        body.innerHTML = step.body;
      } else if (isComplete) {
        status.textContent = step.success;
        caption.textContent = 'Completed during the latest performance cycle.';
        body.innerHTML = step.body;
      } else {
        status.textContent = index === 0 ? 'Ready' : 'Not yet run';
        caption.textContent = 'Start the cycle to produce published business performance results.';
        body.innerHTML = lockedBody(index);
      }
      const button = eq('[data-run-epm]');
      button.querySelector('span').textContent = running ? 'Performance cycle running' : (cycleComplete ? 'Replay performance cycle' : 'Run performance cycle');
      button.disabled = running;
    };

    eqa('[data-cycle-step]').forEach((item,index) => {
      const activate = () => { if (!running) renderStage(index); };
      item.addEventListener('click', activate);
      item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
    });

    eq('[data-run-epm]').addEventListener('click', async () => {
      if (running) return;
      running = true;
      cycleComplete = false;
      completedSteps.clear();
      for (let i = 0; i < steps.length; i++) {
        renderStage(i, 'running');
        await wait(reducedMotion ? 80 : (i === steps.length - 1 ? 1050 : 900));
        completedSteps.add(i);
        renderStage(i, 'complete');
        await wait(reducedMotion ? 10 : 320);
      }
      running = false;
      cycleComplete = true;
      renderStage(steps.length - 1);
    });

    renderStage(0);
  }


  const ediDemo = document.querySelector('[data-edi-demo]');
  if (ediDemo) {
    const eqi = selector => ediDemo.querySelector(selector);
    const eqia = selector => [...ediDemo.querySelectorAll(selector)];
    const appLabels = {client:'Client intelligence', ip:'IP intelligence', rafiq:'Rafiq AI', future:'Intelligence roadmap'};
    let resetClientDemo = () => {};
    let resetIpDemo = () => {};
    let resetRafiqDemo = () => {};
    const appResetters = {client: () => resetClientDemo(), ip: () => resetIpDemo(), rafiq: () => resetRafiqDemo(), future: () => {}};
    const appButtons = eqia('[data-edi-app]');
    let activeEdiKey = 'client';
    const activateEdiApp = (button, moveFocus = false) => {
      const key = button.dataset.ediApp;
      appButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      eqia('[data-edi-view]').forEach(view => {
        const active = view.dataset.ediView === key;
        view.classList.toggle('is-active', active);
        view.hidden = !active;
      });
      eqi('[data-edi-status]').textContent = appLabels[key];
      if (key !== activeEdiKey) appResetters[activeEdiKey]();
      activeEdiKey = key;
      appResetters[key]();
      if (moveFocus) button.focus();
    };
    appButtons.forEach((button, index) => {
      button.addEventListener('click', () => activateEdiApp(button));
      button.addEventListener('keydown', event => {
        const vertical = window.matchMedia('(min-width: 761px)').matches;
        const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
        const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
        if (![previousKey,nextKey,'Home','End'].includes(event.key)) return;
        event.preventDefault();
        let targetIndex = index;
        if (event.key === previousKey) targetIndex = (index - 1 + appButtons.length) % appButtons.length;
        if (event.key === nextKey) targetIndex = (index + 1) % appButtons.length;
        if (event.key === 'Home') targetIndex = 0;
        if (event.key === 'End') targetIndex = appButtons.length - 1;
        activateEdiApp(appButtons[targetIndex], true);
      });
    });

    const clientProfiles = {
      northbridge: {
        name:'Northbridge Consumer', avatar:'NC',
        states: {
          payment:{summary:'Payment behavior risk',level:'Elevated',confidence:'84%',posture:'Review',evidence:[['Settlement pattern','Slowing','Recent settlements are taking longer.'],['Recent delay trend','+18%','Delay direction is worsening.'],['Payment consistency','Low','Payment timing varies across recent cycles.'],['Collection exposure','Elevated','Behavioral signals merit prioritised review.']],action:'Review account history before collection escalation.',note:'Model output supports prioritisation; the relationship owner makes the decision.'},
          sentiment:{summary:'Communication sentiment',level:'Deteriorating',confidence:'79%',posture:'Service review',evidence:[['Polarity trend','Negative','Recent communication is trending downward.'],['Repeated follow-up','Detected','Follow-up frequency is increasing.'],['Service concern','Response time','Response-time themes recur in messages.'],['Relationship implication','Friction risk','Signals warrant human interpretation.']],action:'Trigger a service review before the next client conversation.',note:'Sentiment signals support the Service Excellence programme and require human interpretation.'},
          combined:{summary:'Combined relationship profile',level:'Requires attention',confidence:'86%',posture:'Intervene',evidence:[['Payment behavior','Elevated risk','Settlement behavior is weakening.'],['Email sentiment','Deteriorating','Communication signals are moving negatively.'],['Relationship trend','Weakening','Multiple signals reinforce one another.'],['Decision readiness','Human review','No automated client action is taken.']],action:'Coordinate a relationship intervention before collection escalation.',note:'The profile combines approved analytical outputs; no automated client action is taken.'}
        }
      },
      meridian: {
        name:'Meridian Technologies', avatar:'MT',
        states: {
          payment:{summary:'Payment behavior risk',level:'Stable',confidence:'81%',posture:'Maintain',evidence:[['Settlement pattern','Consistent','Payment timing remains dependable.'],['Recent delay trend','-6%','Delay direction is improving.'],['Payment consistency','High','Recent cycles show stable behavior.'],['Collection exposure','Low','No elevated behavioral signal is present.']],action:'Maintain the current collection approach and continue monitoring.',note:'The profile indicates stable behavior; the relationship owner retains decision accountability.'},
          sentiment:{summary:'Communication sentiment',level:'Improving',confidence:'76%',posture:'Engage',evidence:[['Polarity trend','Positive','Recent communication is improving.'],['Repeated follow-up','Not detected','No repeated escalation pattern appears.'],['Service theme','Responsiveness','Positive themes relate to responsiveness.'],['Relationship implication','Opportunity','The signal supports a proactive conversation.']],action:'Use the positive service trend to support the next relationship conversation.',note:'Email analytics identifies themes and polarity; human review remains required.'},
          combined:{summary:'Combined relationship profile',level:'Healthy',confidence:'83%',posture:'Explore',evidence:[['Payment behavior','Stable','Payment signals remain dependable.'],['Email sentiment','Improving','Communication signals are positive.'],['Relationship trend','Strengthening','Combined indicators are moving favorably.'],['Decision readiness','Human review','A relevant growth conversation may be considered.']],action:'Explore a relevant cross-selling conversation at the next review.',note:'This is a synthetic recommendation from approved profile signals, not an automated action.'}
        }
      },
      harbor: {
        name:'Harbor Legal Group', avatar:'HL',
        states: {
          payment:{summary:'Payment behavior risk',level:'Watch',confidence:'78%',posture:'Monitor',evidence:[['Settlement pattern','Variable','Payment timing is inconsistent.'],['Recent delay trend','+9%','Delay direction is worsening modestly.'],['Payment consistency','Moderate','Recent cycles require observation.'],['Collection exposure','Watch','Open items should be reviewed.']],action:'Confirm open payment items before the next billing cycle.',note:'The model highlights behavioral risk for review; it does not determine collection action.'},
          sentiment:{summary:'Communication sentiment',level:'Neutral',confidence:'73%',posture:'Review theme',evidence:[['Polarity trend','Neutral','No strong directional sentiment appears.'],['Repeated follow-up','Occasional','Some follow-up is present.'],['Service theme','Documentation','Documentation is the recurring theme.'],['Relationship implication','Context needed','Underlying correspondence requires review.']],action:'Review documentation-related feedback during the next service check-in.',note:'Sentiment is contextual and should be reviewed alongside the underlying correspondence.'},
          combined:{summary:'Combined relationship profile',level:'Monitor',confidence:'80%',posture:'Monitor',evidence:[['Payment behavior','Watch','Payment behavior merits observation.'],['Email sentiment','Neutral','Communication has no strong direction.'],['Relationship trend','Stable','No broad deterioration is detected.'],['Decision readiness','Next cycle','Review after the next performance cycle.']],action:'Keep the relationship on the monitoring list and review after the next cycle.',note:'The combined profile supports prioritisation and requires a human relationship decision.'}
        }
      }
    };
    const clientSelect = eqi('[data-client-select]');
    const clientEmpty = eqi('[data-client-empty]');
    const clientResults = eqi('[data-client-results]');
    clientResults.tabIndex = -1;
    const setClientOutputState = state => {
      const showEmpty = state === 'idle';
      const showResults = state === 'complete';
      clientEmpty.hidden = !showEmpty;
      clientResults.hidden = !showResults;
      clientEmpty.setAttribute('aria-hidden', String(!showEmpty));
      clientResults.setAttribute('aria-hidden', String(!showResults));
    };
    const clientRun = eqi('[data-run-client]');
    let clientRunning = false;
    let clientComplete = false;
    let clientRunVersion = 0;
    let clientSignal = 'payment';
    const clientPause = ms => new Promise(resolve => setTimeout(resolve, reducedMotion ? 25 : ms));
    const currentClient = () => clientProfiles[clientSelect.value];
    const renderClient = key => {
      clientSignal = key;
      const state = currentClient().states[key];
      const panel = eqi('[data-client-panel]');
      eqi('[data-client-summary]').innerHTML = `<div><span>Relationship signal</span><b>${state.level}</b></div><div><span>Model confidence</span><b>${state.confidence}</b></div><div><span>Recommended posture</span><b>${state.posture}</b></div>`;
      panel.innerHTML = `<div class="signal-evidence edi-evidence-grid">${state.evidence.map(([a,b,c])=>`<div><span>${a}</span><b>${b}</b><small>${c}</small></div>`).join('')}</div><div class="recommended-action"><span>Recommended action</span><b>${state.action}</b><small>${state.note}</small></div>`;
      eqia('[data-client-signal]').forEach(button => button.classList.toggle('is-active', button.dataset.clientSignal === key));
    };
    const resetClient = () => {
      clientRunVersion += 1;
      clientRunning = false;
      const profile = currentClient();
      eqi('[data-client-name]').textContent = profile.name;
      eqi('[data-client-avatar]').textContent = profile.avatar;
      eqia('[data-client-step]').forEach(step => {
        step.classList.remove('is-running','is-complete');
        step.querySelector('em').textContent = step.dataset.clientStep === 'payment' ? 'Ready' : 'Waiting';
      });
      eqi('[data-client-stage-title]').textContent = 'Profile inputs ready';
      eqi('[data-client-stage-copy]').textContent = 'Select a synthetic client, then run the demonstration.';
      setClientOutputState('idle');
      clientRun.querySelector('span').textContent = 'Build client profile';
      clientRun.disabled = false;
      clientComplete = false;
      clientSignal = 'payment';
    };
    resetClientDemo = resetClient;
    clientSelect.addEventListener('change', resetClient);
    eqia('[data-client-signal]').forEach(button => button.addEventListener('click', () => {
      if (clientComplete) renderClient(button.dataset.clientSignal);
    }));
    clientRun.addEventListener('click', async () => {
      if (clientRunning) return;
      if (clientComplete) resetClient();
      clientRunning = true;
      const runVersion = ++clientRunVersion;
      clientRun.disabled = true;
      clientRun.querySelector('span').textContent = 'Building profile';
      eqi('[data-client-stage-title]').textContent = 'Building client intelligence';
      eqi('[data-client-stage-copy]').textContent = 'Approved behavioral signals are being interpreted and assembled.';
      setClientOutputState('running');
      for (const step of eqia('[data-client-step]')) {
        step.classList.add('is-running');
        step.querySelector('em').textContent = 'Analysing';
        await clientPause(720);
        if (runVersion !== clientRunVersion) return;
        step.classList.remove('is-running');
        step.classList.add('is-complete');
        step.querySelector('em').textContent = 'Complete';
        await clientPause(260);
        if (runVersion !== clientRunVersion) return;
      }
      eqi('[data-client-stage-title]').textContent = 'Decision-ready profile built';
      eqi('[data-client-stage-copy]').textContent = 'Headline risk, supporting evidence, and a recommended action are now available.';
      setClientOutputState('complete');
      renderClient('payment');
      clientRun.disabled = false;
      clientRun.querySelector('span').textContent = 'Build again';
      clientComplete = true;
      clientRunning = false;
      if (!reducedMotion) clientResults.animate([{opacity:.72,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});
      clientResults.focus({preventScroll:true});
    });
    resetClient();


    const ipScenarios = {
      health:{avatar:'AH',company:'Atlas Health Technologies',copy:'Global IP portfolio · healthcare prospect',tier:'High priority',confidence:'78%',signals:{'mena-portfolio-gap':['Strong','Active portfolio; no regional presence detected'],'filing-velocity':['Rising','Recent activity is above its prior pattern'],'geographic-expansion':['Detected','New regions added before MENA'],'market-relevance':['High','Healthcare expansion signals align']},action:'Prepare a MENA portfolio-gap brief for senior BD review.',note:'Investigate and validate the opportunity before outreach. The model prioritises signals; it does not predict a filing date.'},
      consumer:{avatar:'NC',company:'Northstar Consumer Group',copy:'Global brand portfolio · consumer prospect',tier:'High priority',confidence:'82%',signals:{'mena-portfolio-gap':['Strong','International portfolio with no regional presence detected'],'filing-velocity':['Accelerating','Recent brand activity is increasing'],'geographic-expansion':['Detected','Southeast Asia and Europe expanded recently'],'market-relevance':['High','Consumer expansion signals align with MENA activity']},action:'Prepare a tailored MENA brand-entry brief for senior BD review.',note:'Validate the public signals and portfolio gap before outreach. No filing date is estimated.'},
      technology:{avatar:'MT',company:'Meridian Technology Ventures',copy:'Technology portfolio · market-entry prospect',tier:'Priority review',confidence:'74%',signals:{'mena-portfolio-gap':['Moderate','No regional designation is visible in the reviewed scope'],'filing-velocity':['Rising','New technology marks are appearing more frequently'],'geographic-expansion':['Emerging','Recent activity suggests broader market entry'],'market-relevance':['Relevant','Technology and investment signals support review']},action:'Validate the market-entry signal and prepare an IP coverage summary.',note:'Treat this as a prioritised investigation, not a forecast of future filing activity.'}
    };
    const renderIpScenario = () => {
      const scenarioSelect = eqi('[data-ip-scenario]');
      if (!scenarioSelect) return;
      const scenario = ipScenarios[scenarioSelect.value];
      eqi('[data-ip-avatar]').textContent = scenario.avatar;
      eqi('[data-ip-company]').textContent = scenario.company;
      eqi('[data-ip-company-copy]').textContent = scenario.copy;
      eqi('[data-ip-opportunity-tier]').textContent = scenario.tier;
      eqi('[data-ip-confidence]').textContent = scenario.confidence;
      eqia('[data-ip-signal-key]').forEach(card => {
        const [value,note] = scenario.signals[card.dataset.ipSignalKey];
        card.querySelector('b').textContent = value;
        card.querySelector('small').textContent = note;
      });
      eqi('[data-ip-action]').textContent = scenario.action;
      eqi('[data-ip-action-note]').textContent = scenario.note;
    };

    const ipButton = eqi('[data-detect-opportunity]');
    if (ipButton) {
      let ipRunning = false;
      let ipComplete = false;
      let ipRunVersion = 0;
      const ipScenarioSelect = eqi('[data-ip-scenario]');
      const pause = ms => new Promise(resolve => setTimeout(resolve, reducedMotion ? 25 : ms));
      const resetIp = () => {
        ipRunVersion += 1;
        ipRunning = false;
        const workspace = eqi('[data-ip-workspace]');
        workspace.classList.remove('is-running');
        eqia('[data-ip-source]').forEach(source => {
          source.classList.remove('is-scanning','is-detected');
          source.querySelector('em').textContent = 'Ready';
        });
        eqia('[data-ip-signal]').forEach(signal => signal.classList.remove('is-visible'));
        eqi('[data-ip-empty]').hidden = false;
        eqi('[data-ip-result]').hidden = true;
        eqi('[data-ip-stage-title]').textContent = 'External signals ready';
        eqi('[data-ip-stage-copy]').textContent = 'Run the demonstration to surface a synthetic MENA opportunity from public signals.';
        ipButton.querySelector('span').textContent = 'Detect opportunities';
        ipButton.disabled = false;
        ipComplete = false;
        renderIpScenario();
      };
      resetIpDemo = resetIp;
      ipScenarioSelect.addEventListener('change', resetIp);
      renderIpScenario();
      ipButton.addEventListener('click', async () => {
        if (ipRunning) return;
        if (ipComplete) resetIp();
        ipRunning = true;
        const runVersion = ++ipRunVersion;
        ipButton.disabled = true;
        ipButton.querySelector('span').textContent = 'Scanning signals';
        const workspace = eqi('[data-ip-workspace]');
        workspace.classList.add('is-running');
        eqi('[data-ip-stage-title]').textContent = 'Scanning external IP signals';
        eqi('[data-ip-stage-copy]').textContent = 'Reviewing public filing activity, geographic expansion, and market context.';
        for (const source of eqia('[data-ip-source]')) {
          source.classList.add('is-scanning');
          source.querySelector('em').textContent = 'Scanning';
          await pause(1050);
          if (runVersion !== ipRunVersion) return;
          source.classList.remove('is-scanning');
          source.classList.add('is-detected');
          source.querySelector('em').textContent = 'Signal found';
          await pause(420);
          if (runVersion !== ipRunVersion) return;
        }
        await pause(720);
        if (runVersion !== ipRunVersion) return;
        eqi('[data-ip-empty]').hidden = true;
        eqi('[data-ip-result]').hidden = false;
        eqi('[data-ip-stage-title]').textContent = 'Priority opportunity detected';
        eqi('[data-ip-stage-copy]').textContent = 'Multiple external signals combine into a decision-ready outreach opportunity.';
        for (const signal of eqia('[data-ip-signal]')) {
          signal.classList.add('is-visible');
          await pause(340);
          if (runVersion !== ipRunVersion) return;
        }
        workspace.classList.remove('is-running');
        ipButton.disabled = false;
        ipButton.querySelector('span').textContent = 'Scan again';
        ipRunning = false;
        ipComplete = true;
        const ipResult = eqi('[data-ip-result]');
        ipResult.tabIndex = -1;
        ipResult.focus({preventScroll:true});
      });
    }

    const rafiqBriefs = {
      executive: {
        title: 'Business priorities for this week',
        summary: 'Three decision areas require attention across client health, performance variance, and external opportunity signals.',
        confidence: 'Confidence 86%',
        findings: [
          ['Client relationships','Priority review','Combined payment and communication signals are weakening.'],
          ['Performance','Outside expected range','Selected operational indicators require management attention.'],
          ['IP opportunity','High-priority signal','A synthetic target shows a strong MENA opportunity pattern.']
        ],
        action: 'Review the client-risk brief, confirm the operational variance owner, and validate the IP opportunity before outreach.',
        owner: 'Decision owner: Relevant business owners with ADI support.',
        sources: ['Monthly Group Performance Results','Client Profiler Output','IP Intelligence Output'],
        explanation: 'Rafiq prioritised only signals that were outside expected ranges or carried an elevated intelligence status. It did not use restricted totals or uncontrolled raw enterprise records.'
      },
      clients: {
        title: 'Client relationships requiring attention',
        summary: 'Three synthetic client profiles show a combined deterioration in payment behaviour, communication sentiment, or relationship activity.',
        confidence: 'Confidence 84%',
        findings: [
          ['Payment behaviour','Elevated risk','Settlement patterns are slowing and consistency is weakening.'],
          ['Email sentiment','Deteriorating','Repeated follow-up and service-delay themes are increasing.'],
          ['Relationship profile','Review required','Multiple signals now point to potential relationship friction.']
        ],
        action: 'Complete a relationship review before collection escalation and assign ownership of the next client conversation.',
        owner: 'Decision owner: Relationship manager; human review required.',
        sources: ['edw.clients','edw.billings','Payment Behavior Output','Email Sentiment Output'],
        explanation: 'The answer combines approved client-level analytical outputs. A client is surfaced only when multiple signals reinforce one another; the model does not make an autonomous relationship decision.'
      },
      performance: {
        title: 'Performance outside the expected range',
        summary: 'A small set of performance indicators moved beyond their expected benchmark range and require explanation or action.',
        confidence: 'Confidence 91%',
        findings: [
          ['Revenue','Favourable movement','Growth remains above the historical comparison range.'],
          ['Operations','Requires attention','Backlog movement is unfavourable despite stable demand.'],
          ['Clients','Within range','Retention remains inside the expected variation band.']
        ],
        action: 'Review the operational variance drivers and confirm whether corrective action is required before the next checkpoint.',
        owner: 'Decision owner: Operations with the relevant business owner.',
        sources: ['Monthly Group Performance Results','KPI Dictionary','Benchmark Output'],
        explanation: 'Rafiq used published EPM outputs and benchmark classifications. Restricted absolute values remain hidden; the answer relies on direction, variance status, and approved KPI definitions.'
      },
      ip: {
        title: 'Organisations showing strong MENA IP signals',
        summary: 'A synthetic organisation displays a meaningful combination of portfolio gap, filing momentum, geographic expansion, and market relevance.',
        confidence: 'Confidence 78%',
        findings: [
          ['MENA portfolio gap','Strong','Active international portfolio with no regional presence detected.'],
          ['Filing velocity','Rising','Recent activity is above the organisation’s prior pattern.'],
          ['Expansion pattern','Relevant','Public signals indicate broader geographic expansion.']
        ],
        action: 'Prepare a MENA portfolio-gap brief for senior BD validation before any outreach decision.',
        owner: 'Decision owner: Senior BD; filing date is not estimated.',
        sources: ['WIPO Madrid','EUIPO','USPTO','Public Expansion Signals'],
        explanation: 'Rafiq summarised the approved IP Intelligence output. The underlying model prioritises opportunity signals; it does not claim that a filing will occur or predict a filing date.'
      },
      service: {
        title: 'Service-excellence signals deteriorating',
        summary: 'Synthetic communication analytics indicate that response-time and repeated-follow-up themes are increasing in selected client interactions.',
        confidence: 'Confidence 81%',
        findings: [
          ['Response time','Deteriorating','More messages reference delayed replies or unresolved follow-up.'],
          ['Client sentiment','Negative trend','Negative polarity is increasing across recent interactions.'],
          ['Service theme','Repeated issue','The same concern appears across multiple communications.']
        ],
        action: 'Review the affected interaction journey and validate whether a service-recovery action is required.',
        owner: 'Decision owner: Service Excellence lead with the relationship owner.',
        sources: ['Email Sentiment Output','Service Excellence Signals','edw.clients'],
        explanation: 'The answer uses aggregated synthetic communication signals and approved client references. Sentiment indicates a review need; it does not establish causation or replace human assessment.'
      }
    };

    const rafiqWorkspace = eqi('[data-rafiq-workspace]');
    if (rafiqWorkspace) {
      const select = eqi('[data-rafiq-select]');
      const runButton = eqi('[data-run-rafiq]');
      const empty = eqi('[data-rafiq-empty]');
      const brief = eqi('[data-rafiq-brief]');
      brief.tabIndex = -1;
      const setRafiqOutputState = state => {
        const showEmpty = state === 'idle';
        const showBrief = state === 'complete';
        empty.hidden = !showEmpty;
        brief.hidden = !showBrief;
        empty.setAttribute('aria-hidden', String(!showEmpty));
        brief.setAttribute('aria-hidden', String(!showBrief));
      };
      const whyButton = eqi('[data-rafiq-why]');
      const explanation = eqi('[data-rafiq-explanation]');
      const steps = eqia('[data-rafiq-step]');
      let rafiqRunning = false;
      let rafiqRunVersion = 0;

      const wait = ms => new Promise(resolve => setTimeout(resolve, reducedMotion ? 30 : ms));
      const resetRafiq = () => {
        rafiqRunVersion += 1;
        rafiqRunning = false;
        steps.forEach((step, index) => {
          step.classList.remove('is-running','is-complete');
          step.querySelector('[data-step-status]').textContent = index === 0 ? 'Ready' : 'Waiting';
        });
        eqi('[data-rafiq-stage-title]').textContent = 'Question ready';
        eqi('[data-rafiq-stage-copy]').textContent = 'Select a question, then run the grounded demonstration.';
        setRafiqOutputState('idle');
        explanation.hidden = true;
        whyButton.setAttribute('aria-expanded','false');
        whyButton.querySelector('span').textContent = '+';
        runButton.disabled = false;
        runButton.querySelector('span').textContent = 'Ask Rafiq';
      };

      const renderBrief = data => {
        eqi('[data-rafiq-title]').textContent = data.title;
        eqi('[data-rafiq-summary]').textContent = data.summary;
        eqi('[data-rafiq-action]').textContent = data.action;
        eqi('[data-rafiq-owner]').textContent = data.owner;
        const priority = select.value === 'executive' || select.value === 'clients' ? 'High' : select.value === 'ip' ? 'Priority' : 'Review';
        const horizon = select.value === 'executive' ? 'This week' : select.value === 'performance' ? 'Current checkpoint' : 'Next action';
        eqi('[data-rafiq-summary-meta]').innerHTML = `<div><span>Priority</span><b>${priority}</b></div><div><span>Grounding confidence</span><b>${data.confidence.replace('Confidence ','')}</b></div><div><span>Decision horizon</span><b>${horizon}</b></div>`;
        const findings = [...data.findings, ['Decision basis','Approved outputs','The response remains grounded and reviewable.']].slice(0,4);
        eqi('[data-rafiq-findings]').innerHTML = findings.map(([label,value,note]) => `<div class="rafiq-finding"><span>${label}</span><b>${value}</b><small>${note}</small></div>`).join('');
        eqi('[data-rafiq-sources]').innerHTML = data.sources.map(source => `<li>${source}</li>`).join('');
        explanation.textContent = data.explanation;
      };

      const setStep = async (index, runningLabel, completeLabel, runVersion) => {
        const step = steps[index];
        const status = step.querySelector('[data-step-status]');
        step.classList.add('is-running');
        status.textContent = runningLabel;
        await wait(900);
        if (runVersion !== rafiqRunVersion) return false;
        step.classList.remove('is-running');
        step.classList.add('is-complete');
        status.textContent = completeLabel;
        await wait(360);
        return runVersion === rafiqRunVersion;
      };

      resetRafiqDemo = resetRafiq;
      select.addEventListener('change', resetRafiq);

      runButton.addEventListener('click', async () => {
        if (rafiqRunning) return;
        resetRafiq();
        rafiqRunning = true;
        const runVersion = ++rafiqRunVersion;
        runButton.disabled = true;
        runButton.querySelector('span').textContent = 'Analysing question';
        eqi('[data-rafiq-stage-title]').textContent = 'Grounding the decision question';
        eqi('[data-rafiq-stage-copy]').textContent = 'Rafiq is retrieving approved evidence and validating the answer scope.';
        setRafiqOutputState('running');
        if (!await setStep(0,'Interpreting','Interpreted',runVersion)) return;
        if (!await setStep(1,'Retrieving','Evidence found',runVersion)) return;
        if (!await setStep(2,'Validating','Grounded',runVersion)) return;
        if (!await setStep(3,'Composing','Complete',runVersion)) return;
        renderBrief(rafiqBriefs[select.value]);
        eqi('[data-rafiq-stage-title]').textContent = 'Grounded decision brief ready';
        eqi('[data-rafiq-stage-copy]').textContent = 'The headline conclusion, evidence, and recommended action are now available.';
        setRafiqOutputState('complete');
        runButton.disabled = false;
        runButton.querySelector('span').textContent = 'Ask another question';
        rafiqRunning = false;
        brief.focus({preventScroll:true});
      });

      whyButton.addEventListener('click', () => {
        const expanded = whyButton.getAttribute('aria-expanded') === 'true';
        whyButton.setAttribute('aria-expanded', String(!expanded));
        explanation.hidden = expanded;
      });
    }
  }

})();
