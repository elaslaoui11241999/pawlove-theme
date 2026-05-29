/* TOAST */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}

/* MOBILE MENU */
function toggleMob(){document.getElementById('mobNav').classList.toggle('open')}

/* SEARCH */
let searchOpen=false;
function toggleSearch(){
  searchOpen=!searchOpen;
  const bar=document.getElementById('searchBar');
  const res=document.getElementById('searchResults');
  bar.classList.toggle('open',searchOpen);
  if(searchOpen){setTimeout(()=>document.getElementById('searchInput').focus(),200)}
  else{res.classList.remove('show');res.innerHTML='';document.getElementById('searchInput').value=''}
}

/* Search with Shopify Predictive Search API */
document.getElementById('searchInput').addEventListener('input',function(){
  const q=this.value.trim();
  const res=document.getElementById('searchResults');
  if(q.length<2){res.classList.remove('show');res.innerHTML='';return}
  fetch('/search/suggest?q='+encodeURIComponent(q)+'&resources[type]=product&resources[limit]=6&section_id=predictive-search')
    .then(r=>r.text()).then(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const items=doc.querySelectorAll('[data-predictive-search-result]');
      if(!items.length){
        res.innerHTML='<div class="sr-empty">No encontramos "'+q+'"</div>';
      } else {
        res.innerHTML=Array.from(items).map(item=>{
          const img=item.querySelector('img');
          const title=item.querySelector('[data-result-title]');
          const price=item.querySelector('[data-result-price]');
          const url=item.querySelector('a');
          if(!title)return'';
          return '<a class="sr-item" href="'+(url?url.href:'#')+'">'
            +'<img class="sr-img" src="'+(img?img.src:'')+'" alt="">'
            +'<div><div class="sr-name">'+(title?title.textContent:'')+'</div></div>'
            +'<div class="sr-price">'+(price?price.textContent:'')+'</div>'
            +'</a>';
        }).join('');
      }
      res.classList.add('show');
    }).catch(()=>{
      res.innerHTML='<div class="sr-empty">Busca en <a href="/search?q='+encodeURIComponent(q)+'">todos los productos</a></div>';
      res.classList.add('show');
    });
});

document.addEventListener('click',e=>{
  if(searchOpen&&!document.getElementById('searchBar').contains(e.target)&&!document.getElementById('searchBtn').contains(e.target)&&!document.getElementById('searchResults').contains(e.target)){toggleSearch()}
});

/* MODAL */
function openShopifyModal(btn){
  document.getElementById('m-img').src=btn.dataset.img||'';
  document.getElementById('m-brand').textContent=btn.dataset.brand||'';
  document.getElementById('m-title').textContent=btn.dataset.title||'';
  document.getElementById('m-stars').innerHTML='&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;';
  document.getElementById('m-price').textContent=btn.dataset.price||'';
  document.getElementById('m-old').textContent=btn.dataset.old||'';
  document.getElementById('m-desc').textContent=btn.dataset.desc||'';
  document.getElementById('m-feats').innerHTML='';
  const variantId=btn.dataset.id;
  const productUrl=btn.dataset.url;
  const atcBtn=document.getElementById('m-atc');
  if(variantId){
    atcBtn.onclick=function(){addToCart(variantId,btn.dataset.title)};
  } else {
    atcBtn.onclick=function(){window.location=productUrl};
    atcBtn.textContent='Ver producto';
  }
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(e){if(e.target===document.getElementById('overlay'))closeModalDirect()}
function closeModalDirect(){document.getElementById('overlay').classList.remove('open');document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModalDirect()});

/* ADD TO CART via Shopify AJAX API */
function addToCart(variantId,name){
  fetch('/cart/add.js',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:variantId,quantity:1})
  }).then(r=>r.json()).then(()=>{
    return fetch('/cart.js').then(r=>r.json());
  }).then(cart=>{
    document.getElementById('cartCount').textContent=cart.item_count;
    showToast('🐾 '+name+' añadido al carrito');
    closeModalDirect();
  }).catch(()=>{showToast('Error al añadir. Intenta de nuevo.')});
}

/* FILTER by product type */
function filterCat(type){
  document.querySelectorAll('#prodGrid .prod-card').forEach(c=>{
    const ptype=c.dataset.type||'';
    c.style.display=(!type||ptype.toLowerCase().includes(type.toLowerCase()))?'':'none';
  });
  const title=document.getElementById('prod-title');
  if(title) title.innerHTML=(type||'Todos los')+' <em>productos</em>';
  document.getElementById('productos').scrollIntoView({behavior:'smooth'});
}

/* HERO ANIMAL rotation */
const animals=['🐶','🐱','🐹','🐇','🐦','🐠'];
let ai=0;
const ha=document.getElementById('heroAnimal');
if(ha){
  setInterval(()=>{
    ha.style.opacity='0';ha.style.transform='scale(.7) rotate(-10deg)';
    setTimeout(()=>{ai=(ai+1)%animals.length;ha.textContent=animals[ai];ha.style.opacity='1';ha.style.transform='scale(1) rotate(0)'},300);
  },3000);
}
