// Bestell-Rechner • Burger Shot
// Letzte Version: drei Spalten, Preise ohne Dezimalstellen, $ am Ende,
// fester Restaurantname 'Burger Shot', Rechnungstext ohne Gesamtpreis.
// +1 und -1 Buttons sind jetzt exakt gleich groß.

const ITEMS = [
  { id: 'murder', name: 'Murder Meal', category: 'food', price: 2000 },
  { id: 'burger', name: 'Burger Shot', category: 'food', price: 300 }, // renamed
  { id: 'nuggets', name: 'Chicken Nuggets', category: 'food', price: 300 },
  { id: 'wings', name: 'Shot Wings', category: 'food', price: 250 },
  { id: 'fries', name: 'Shot Fries', category: 'food', price: 250 },
  { id: 'bleeder', name: 'The Bleeder', category: 'food', price: 200 },

  { id: 'lolli', name: 'Lollipop', category: 'dessert', price: 150 },
  { id: 'icecream', name: 'Icecream', category: 'dessert', price: 150 },

  { id: 'shake', name: 'Shot Shake', category: 'drink', price: 200 },
  { id: 'ice', name: 'Shot Ice', category: 'drink', price: 200 },
];

const RESTAURANT_NAME = 'Burger Shot'; // fixed restaurant name updated

const state = {};
ITEMS.forEach(i => state[i.id] = 0);

const foodList = document.getElementById('food-list');
const dessertList = document.getElementById('dessert-list');
const drinkList = document.getElementById('drink-list');

function currency(value){
  // Keine Dezimalstellen, Tausendertrennung nach DE, $ am Ende (z.B. 2.000$ oder 200$)
  return value.toLocaleString('de-DE') + '$';
}

function createItemRow(item){
  const row = document.createElement('div');
  row.className = 'item';
  row.dataset.id = item.id;

  const left = document.createElement('div');
  left.className = 'left';
  left.innerHTML = `<div class="badge-price">${currency(item.price)}</div>`;

  const nameWrap = document.createElement('div');
  const nameDiv = document.createElement('div');
  nameDiv.className = 'name';
  nameDiv.textContent = item.name;
  const muted = document.createElement('div');
  muted.className = 'muted';
  muted.textContent = item.category === 'drink' ? 'Getränk' : item.category === 'dessert' ? 'Dessert' : 'Essen';

  nameWrap.appendChild(nameDiv);
  nameWrap.appendChild(muted);
  left.appendChild(nameWrap);

  const controls = document.createElement('div');
  controls.className = 'controls';

  const btnMinus5 = document.createElement('button');
  btnMinus5.className = 'btn small minus';
  btnMinus5.textContent = '-5';
  btnMinus5.addEventListener('click', () => changeCount(item.id, -5));

  const btnMinus1 = document.createElement('button');
  // keep -1 as 'btn minus'
  btnMinus1.className = 'btn minus';
  btnMinus1.textContent = '-1';
  btnMinus1.addEventListener('click', () => changeCount(item.id, -1));

  const spanCount = document.createElement('div');
  spanCount.className = 'count';
  spanCount.textContent = '0';
  spanCount.id = `count-${item.id}`;

  const btnPlus1 = document.createElement('button');
  // ensure +1 uses same sizing class as -1 (btn plus)
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
  ITEMS.forEach(item => {
    const row = createItemRow(item);
    if(item.category === 'food') foodList.appendChild(row);
    else if(item.category === 'dessert') dessertList.appendChild(row);
    else if(item.category === 'drink') drinkList.appendChild(row);
  });
}

function changeCount(id, delta){
  state[id] = Math.max(0, state[id] + delta);
  document.getElementById(`count-${id}`).textContent = state[id];
  updateTotals();
}

function updateTotals(){
  // Desserts zählen jetzt als Essen (werden mitgezählt)
  const totalFood = ITEMS.filter(i => i.category === 'food' || i.category === 'dessert')
                         .reduce((s,i) => s + state[i.id], 0);
  const totalDrink = ITEMS.filter(i => i.category === 'drink').reduce((s,i) => s + state[i.id], 0);
  const totalPrice = ITEMS.reduce((s,i) => s + state[i.id] * i.price, 0);

  document.getElementById('total-food').textContent = totalFood;
  document.getElementById('total-drink').textContent = totalDrink;
  document.getElementById('total-price').textContent = currency(totalPrice);
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

  // Desserts werden bei der Personenregel als Essen gezählt
  const totalFood = ITEMS.filter(i => i.category === 'food' || i.category === 'dessert')
                         .reduce((s,i) => s + state[i.id], 0);
  const totalDrink = ITEMS.filter(i => i.category === 'drink').reduce((s,i) => s + state[i.id], 0);

  const ordered = ITEMS
    .map(i => ({ name: i.name, count: state[i.id], category: i.category }))
    .filter(x => x.count > 0);

  if(ordered.length === 0){
    return `${date} | ${restaurant} | Keine Artikel bestellt`;
  }

  // Personenregel: max 5 Essen (inkl. Desserts) und 5 Getränke pro Person
  const personsFood = Math.ceil(totalFood / 5);
  const personsDrink = Math.ceil(totalDrink / 5);
  const persons = Math.max(personsFood, personsDrink, 1);

  const personsString = `${persons}P`;

  const parts = ordered.map(x => `${x.count}x ${x.name}`);
  const itemsText = parts.join(', ');

  // Kein Gesamtpreis im Rechnungstext (wie gewünscht)
  return `${date} | ${restaurant} | ${personsString} | ${itemsText}`;
}

function copyInvoiceToClipboard(){
  const text = composeInvoiceText();
  const invoiceArea = document.getElementById('invoiceText');
  invoiceArea.value = text;

  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyInvoice');
      const old = btn.textContent;
      btn.textContent = 'Kopiert ✓';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 1300);
    }).catch(() => {
      // fallback: select text for manual copy
      invoiceArea.select();
      alert('Automatisches Kopieren fehlgeschlagen. Bitte den Text markieren und kopieren.');
    });
  } else {
    invoiceArea.select();
    alert('Clipboard API nicht verfügbar. Bitte den Text markieren und kopieren.');
  }
}

function resetAll(){
  for(const k in state) state[k] = 0;
  ITEMS.forEach(i => {
    const el = document.getElementById(`count-${i.id}`);
    if(el) el.textContent = '0';
  });
  updateTotals();
  document.getElementById('invoiceText').value = '';
}

// Events
document.getElementById('copyInvoice').addEventListener('click', copyInvoiceToClipboard);
document.getElementById('resetAll').addEventListener('click', resetAll);

// Initial render
renderLists();
updateTotals();