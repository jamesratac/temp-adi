(function(){
  var root = document.getElementById('site-topnav');
  if(!root) return;
  var depth = root.dataset.depth || '';
  var p = depth;
  var current = document.body.dataset.navCurrent || '';

  var NAV = [
    {id:'home', label:'Home', href:p+'index.html'},
    {id:'about-adi', label:'About adi', href:p+'index.html#about-adi'},
    {id:'our-work', label:'Our Work', href:p+'our-work/index.html', panel:[
      {label:'Current Results', href:p+'our-work/index.html#results'},
      {label:'Archive', href:p+'our-work/index.html#archive'}
    ]},
    {id:'operating-model', label:'Operating Model', href:p+'operating-model/index.html', panel:[
      {label:'Enterprise Information Architecture', href:p+'operating-model/index.html#eia'},
      {label:'Portfolio Model', href:p+'operating-model/index.html#portfolio-model'},
      {label:'Governance & Standards', href:p+'operating-model/index.html#governance'},
      {label:'Design Decisions', href:p+'operating-model/index.html#design'},
      {label:'Taxonomy & Definitions', href:p+'operating-model/index.html#knowledge'},
      {label:"Founder's Reflection", href:p+'operating-model/index.html#founders-notes'}
    ]},
    {id:'library', label:'Library', href:p+'library/index.html', panel:[
      {label:'Standards & Governance', href:p+'library/index.html#governance'},
      {label:'Design Decisions', href:p+'library/index.html#design'},
      {label:'Artifacts', href:p+'library/index.html#artifacts'},
      {label:'Source Documents', href:p+'library/index.html#source'}
    ]}
  ];

  var html = '<div class="topnav-inner"><a class="topnav-logo" href="'+p+'index.html" aria-label="Saba IP Analytics and Decision Intelligence home"><img src="'+p+'assets/saba-ip-logo.png" alt="Saba IP"><span class="wordmark">adi</span></a><nav class="topnav-links" aria-label="Primary navigation">';

  NAV.forEach(function(item){
    var isCurrent = current === item.id || (item.id === 'home' && current === '');
    if(item.panel && item.panel.length){
      html += '<div class="nav-item" data-nav-id="'+item.id+'">'+
        '<a href="'+item.href+'" class="nav-trigger'+(isCurrent?' is-current':'')+'">'+item.label+'</a>'+
        '<div class="nav-panel" role="menu">'+item.panel.map(function(pi){
          return '<a href="'+pi.href+'" role="menuitem">'+pi.label+(pi.sub?'<span>'+pi.sub+'</span>':'')+'</a>';
        }).join('')+
        '</div></div>';
    } else {
      html += '<a href="'+item.href+'"'+(isCurrent?' class="is-current"':'')+'>'+item.label+'</a>';
    }
  });

  html += '<a class="nav-workbench-btn" href="'+p+'workbench/login.html">Request Access</a>';
  html += '</nav></div>';
  root.innerHTML = html;
  root.classList.add('topnav');

  var syncScrolledState = function(){ root.classList.toggle('is-scrolled', window.scrollY > 24); };
  syncScrolledState();
  window.addEventListener('scroll', syncScrolledState, {passive:true});

  var items = root.querySelectorAll('.nav-item');
  var hoverCapable = window.matchMedia('(hover: hover)').matches;
  var closeAll = function(except){
    items.forEach(function(it){ if(it!==except){ it.classList.remove('open'); }});
  };
  if(hoverCapable){
    items.forEach(function(item){
      var openTimer, closeTimer;
      function open(){ clearTimeout(closeTimer); closeAll(item); item.classList.add('open'); }
      function close(){ closeTimer = setTimeout(function(){ item.classList.remove('open'); }, 150); }
      item.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); openTimer = setTimeout(open, 60); });
      item.addEventListener('mouseleave', function(){ clearTimeout(openTimer); close(); });
    });
  }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeAll(); });
})();
