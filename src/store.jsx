import { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext(null);

const DEFAULT = {
  eventName: 'My Event',
  stage: [],
  staff: [],
  drinks: [],
  decorations: [],
  sponsors: [],
  stageDesign: [],
};

function load() {
  try {
    const s = localStorage.getItem('eventData');
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

let idCounter = Date.now();
export function uid() { return ++idCounter; }

export function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function sumItems(items) {
  return items.reduce((acc, i) => {
    const qty = Number(i.qty) || Number(i.count) || 1;
    return acc + qty * (Number(i.unitCost) || 0);
  }, 0);
}

export function EventProvider({ children }) {
  const [data, setData] = useState(load);

  useEffect(() => {
    localStorage.setItem('eventData', JSON.stringify(data));
  }, [data]);

  function update(key, val) {
    setData(d => ({ ...d, [key]: val }));
  }

  function addItem(key, item) {
    setData(d => ({ ...d, [key]: [...d[key], { id: uid(), ...item }] }));
  }

  function removeItem(key, id) {
    setData(d => ({ ...d, [key]: d[key].filter(i => i.id !== id) }));
  }

  return (
    <EventContext.Provider value={{ data, update, addItem, removeItem }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}
