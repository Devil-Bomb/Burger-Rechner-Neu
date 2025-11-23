// Bestell-Rechner • Burger Shot
// Renders items with price badge + product name to its right.
// Prevents duplicate rendering and sets up controls.

const ITEMS = [
  { id: 'murder', name: 'Murder Meal', category: 'food', price: 2000 },
  { id: 'burger', name: 'Burger Shot', category: 'food', price: 300 },
  { id: 'nuggets', name: 'Chicken Nuggets', category: 'food', price: 300 },
  { id: 'wings', name: 'Shot Wings', category: 'food', price: 250 },
  { id: 'fries', name: 'Shot Fries', category: 'food', price: 250 },
  { id: 'bleeder', name: 'The Bleeder', category: 'food', price: 200 },

  { id: 'lolli', name: 'Lollipop', category: 'dessert', price: 150 },
  { id: 'icecream', name: 'Icecream', category: 'dessert', price: 150 },

  { id: 'shake', name: 'Shot Shake', category: 'drink', price: 200 },
  { id: 'ice', name: 'Shot Ice', category: 'drink', price: 200 },
];

const RESTAURANT_NAME = 'Burger Shot';

const state = {};
ITEMS.forEach(i => state[i.id] = 0);

let foodList = null;
let dessertList = null;
let drinkList = null;

function currency(value){
  return value.toLocaleString('de-DE') + '$';
}

function createItemRow(item){
  const row = document.createElement('div');
  row.className = 'item';
  row.dataset.category = item.category === 'drink' ? 'Getränk' : item.category === 'dessert' ? 'Dessert' : 'Essen';
  row.dataset.id = item.id;

  // LEFT block: badge + .text container (name)
  const left = document.createElement('div');
  left.className = 'left';

  const badge = document.createElement('div');
  badge.className = 'badge-price';
  badge.textContent = currency(item.price);

  const textCont = document.createElement('div');
  textCont.className = 'text';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'name';
  nameDiv.textContent = item.name;

  // small muted (created but hidden by CSS)
  const muted = document.createElement('div');
  muted.className = 'muted';
  muted.textContent = item.category === 'drink' ? 'Getränk' : item.category === 'dessert' ? 'Dessert' : 'Essen';

  textCont.appendChild(nameDiv);
  textCont.appendChild(muted);

  left.appendChild(badge);
  left.appendChild(textCont);

  // Controls (right side)
  const controls = document.createElement('div');
  controls.className = 'controls';

  const btnMinus5 = document.createElement('button');
  btnMinus5.className = 'btn small minus';
  btnMinus5.textContent = '-5';
  btnMinus5.addEventListener('click', () => changeCount(item.id, -5));

  const btnMinus1 = document.createElement('button');
  btnMinus1.className = 'btn minus';
  btnMinus1.textContent = '-1';
  btnMinus1.addEventListener('click', () => changeCount(item.id, -1));

  const spanCount = document.createElement('div');
  spanCount.className = 'count';
  spanCount.textContent = '0';
  spanCount.id = `count-${item.id}`;

  const btnPlus1 = document.createElement('button');
  btnPlus1.className = 'btn plus';
  btnPlus1.textContent = '+1';
  btnPlus1.addEventListener('click', () => changeCount(item.id, +1));

  const btnPlus5 = document.createElement('button');
  btnPlus5.className = 'btn small plus';
  btnPlus5.textContent = '+5';
  btnPlus5.addEventListener('click', () => changeCount(item.id, +5));

  controls.appendChild(btnMinus5);
  controls.appendChild(btnMinus1);
  controls.appendChild(spanCount);
  controls.appendChild(btnPlus1);
  controls.appendChild(btnPlus5);

  row.appendChild(left);
  row.appendChild(controls);
  return row;
}

function renderLists(){
  if (!foodList || !dessertList || !drinkList) {
    foodList = document.getElementById('food-list');
    dessertList = document.getElementById('dessert-list');
    drinkList = document.getElementById('drink-list');
    if (!foodList || !dessertList || !drinkList) return;
  }

  // clear lists to avoid duplicates
  foodList.innerHTML = '';
  dessertList.innerHTML = '';
  drinkList.innerHTML = '';

  ITEMS.forEach(item => {
    const row = createItemRow(item);
    if(item.category === 'food') foodList.appendChild(row);
    else if(item.category === 'dessert') dessertList.appendChild(row);
    else if(item.category === 'drink') drinkList.appendChild(row);
  });
}

function changeCount(id, delta){
  state[id] = Math.max(0, state[id] + delta);
  const el = document.getElementById(`count-${id}`);
  if(el) el.textContent = state[id];
  updateTotals();
}

function updateTotals(){
  const totalFood = ITEMS.filter(i => i.category === 'food' || i.category === 'dessert')
                         .reduce((s,i) => s + state[i.id], 0);
  const totalDrink = ITEMS.filter(i => i.category === 'drink').reduce((s,i) => s + state[i.id], 0);
  const totalPrice = ITEMS.reduce((s,i) => s + state[i.id] * i.price, 0);

  const totalFoodEl = document.getElementById('total-food');
  const totalDrinkEl = document.getElementById('total-drink');
  const totalPriceEl = document.getElementById('total-price');

  if(totalFoodEl) totalFoodEl.textContent = totalFood;
  if(totalDrinkEl) totalDrinkEl.textContent = totalDrink;
  if(totalPriceEl) totalPriceEl.textContent = currency(totalPrice);
}

function formatDateDDMMYY(date = new Date()){
  const dd = String(date.getDate()).padStart(2,'0');
  const mm = String(date.getMonth()+1).padStart(2,'0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

function composeInvoiceText(){
  const restaurant = RESTAURANT_NAME;
  const date = formatDateDDMMYY(new Date());

  const totalFood = ITEMS.filter(i => i.category === 'food' || i.category === 'dessert')
                         .reduce((s,i) => s + state[i.id], 0);
  const totalDrink = ITEMS.filter(i => i.category === 'drink').reduce((s,i) => s + state[i.id], 0);

  const ordered = ITEMS
    .map(i => ({ name: i.name, count: state[i.id], category: i.category }))
    .filter(x => x.count > 0);

  if(ordered.length === 0){
    return `${date} | ${restaurant} | Keine Artikel bestellt`;
  }

  const personsFood = Math.ceil(totalFood / 5);
  const personsDrink = Math.ceil(totalDrink / 5);
  const persons = Math.max(personsFood, personsDrink, 1);

  const personsString = `${persons}P`;
  const parts = ordered.map(x => `${x.count}x ${x.name}`);
  const itemsText = parts.join(', ');
  return `${date} | ${restaurant} | ${personsString} | ${itemsText}`;
}

function copyInvoiceToClipboard(){
  const text = composeInvoiceText();
  const invoiceArea = document.getElementById('invoiceText');
  if(invoiceArea) invoiceArea.value = text;

  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyInvoice');
      if(!btn) return;
      const old = btn.textContent;
      btn.textContent = 'Kopiert ✓';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 1300);
    }).catch(() => {
      if(invoiceArea){ invoiceArea.select(); alert('Automatisches Kopieren fehlgeschlagen. Bitte den Text markieren und kopieren.'); }
    });
  } else {
    if(invoiceArea){ invoiceArea.select(); alert('Clipboard API nicht verfügbar. Bitte den Text markieren und kopieren.'); }
  }
}

function resetAll(){
  for(const k in state) state[k] = 0;
  ITEMS.forEach(i => {
    const el = document.getElementById(`count-${i.id}`);
    if(el) el.textContent = '0';
  });
  updateTotals();
  const invoiceArea = document.getElementById('invoiceText');
  if(invoiceArea) invoiceArea.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // attach copy/reset once
  if (!window.__burgershot_initialized) {
    const copyBtn = document.getElementById('copyInvoice');
    const resetBtn = document.getElementById('resetAll');
    if(copyBtn) copyBtn.addEventListener('click', copyInvoiceToClipboard);
    if(resetBtn) resetBtn.addEventListener('click', resetAll);
    window.__burgershot_initialized = true;
  }

  renderLists();
  updateTotals();
});
