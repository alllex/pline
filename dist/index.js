// load language data and build DOM out of it
fetch("./data/_ref.json")
  .then((response) => response.json())
  .then(main);

Object.prototype.myLet = function (f) {
  return f(this);
};
Object.prototype.myAlso = function (f) {
  f(this);
  return this;
};

async function main(rootLangRef) {
  const langDataset = await fetchLangDataset(rootLangRef.languages);
  const sortedLangEvents = sortLangEvents(langDataset);

  const rootElem = document.getElementById("root");
  rootElem.appendChild(document.createElement("hr"));

  rootElem.appendChild(renderTimeline(sortedLangEvents));
}

function renderTimeline(sortedLangEvents) {
  const timelinePlaneWidth = document.documentElement.clientWidth || document.body.clientWidth;
  const timelinePlaneElem = document.createElement("div").myAlso((it) => {
    it.style.position = "relative";
    it.style.width = `${timelinePlaneWidth}px`;
    it.style.background = "aliceblue";
  });

  const timelineSlotHeight = 70;
  const langSlots = [];
  const prevLangSlots = new Map();

  let timelineSlotTop = 0;
  for (langEvent of sortedLangEvents) {
    timelineSlotTop += timelineSlotHeight;

    let langSlotIndex = langSlots.findIndex((it) => langEvent.langIndex >= it.langIndex);
    if (langSlotIndex === -1) {
      // append
      langSlotIndex = langSlots.length;
      langSlots.push(langEvent);
    } else if (langSlots[langSlotIndex].langIndex === langEvent.langIndex) {
      // replace
      langSlots[langSlotIndex] = langEvent;
    } else {
      // insert before
      langSlots.splice(langSlotIndex, 0, langEvent);
    }

    const langEventTop = timelineSlotTop;
    const langSlotWidthStep = timelinePlaneWidth / (langSlots.length + 1);
    const langEventLeft = langSlotWidthStep * (langSlotIndex + 1);

    for (let i = 0; i < langSlots.length; i++) {
      const langIndex = langSlots[i].langIndex;
      const prevLangSlot = prevLangSlots.get(langIndex);
      if (prevLangSlot !== undefined) {
        const prevLangSlotIndex = prevLangSlot.slotIndex;
        if (i < prevLangSlotIndex) {
          const slotGap = prevLangSlotIndex - i;
          const topLineDiv = document.createElement("div");
          topLineDiv.style.position = "absolute";
          topLineDiv.style.zIndex = 1;
          topLineDiv.style.top = `${prevLangSlot.top}px`;
          topLineDiv.style.left = `${prevLangSlot.left - slotGap / 2}px`;
          topLineDiv.style.height = `${(timelineSlotTop - prevLangSlot.top) / 2}px`;
          topLineDiv.style.borderRight = "4px solid blue";
          topLineDiv.style.borderBottom = "4px solid blue";
          timelinePlaneElem.appendChild(topLineDiv);

          const bottomLineDiv = document.createElement("div");
          bottomLineDiv.style.position = "absolute";
          bottomLineDiv.style.zIndex = 1;
          bottomLineDiv.style.top = `${prevLangSlot.top + (timelineSlotTop - prevLangSlot.top) / 2}px`;
          bottomLineDiv.style.left = `${prevLangSlot.left - slotGap}px`;
          bottomLineDiv.style.height = `${(timelineSlotTop - prevLangSlot.top) / 2}px`;
          bottomLineDiv.style.borderTop = "4px solid green";
          bottomLineDiv.style.borderLeft = "4px solid green";
          timelinePlaneElem.appendChild(bottomLineDiv);
        } else if (prevLangSlotIndex < i) {

        } else {
          const vertLineDiv = document.createElement("div");
          vertLineDiv.style.position = "absolute";
          vertLineDiv.style.zIndex = 1;
          vertLineDiv.style.top = `${prevLangSlot.top}px`;
          vertLineDiv.style.left = `${prevLangSlot.left}px`;
          vertLineDiv.style.height = `${timelineSlotTop - prevLangSlot.top}px`;
          vertLineDiv.style.borderLeft = "4px solid red";
          timelinePlaneElem.appendChild(vertLineDiv);
        }
      }
    }

    prevLangSlots.clear();
    for (let i = 0; i < langSlots.length; i++) {
      prevLangSlots.set(langSlots[i].langIndex, {
        slotIndex: i,
        top: timelineSlotTop,
        left: langEventLeft,
      });
    }

    if (langEvent.init) {
      langSlots.splice(langSlotIndex, 1);
    }

    const eventLabel = document.createElement("div").myAlso((it) => {
      it.style.background = "#fafafa";
      if (langEvent.init) {
        it.innerHTML = `<b>${langEvent.language} (${langEvent.date})</b>`;
      } else {
        it.innerText = `${langEvent.language} ${langEvent.version} (${langEvent.date})`;
      }
    });

    const labeledDot = renderLabeledDot(langEventTop, langEventLeft, eventLabel);
    timelinePlaneElem.appendChild(labeledDot);
  }
  timelineSlotTop += timelineSlotHeight;

  timelinePlaneElem.style.height = `${timelineSlotTop}px`;

  return timelinePlaneElem;
}

function renderLabeledDot(top, left, labelContent) {
  const dotSide = 10;

  const dotDiv = document.createElement("div");
  dotDiv.style.position = "absolute";
  dotDiv.style.top = `${top}px`;
  dotDiv.style.left = `${left}px`;
  dotDiv.style.margin = "0";
  dotDiv.style.height = `${dotSide}px`;
  dotDiv.style.width = `${dotSide}px`;
  dotDiv.style.border = "2px solid black";
  // dotDiv.style.borderRadius = "5px";

  const labelDivHeight = 30;
  const labelDivFullHeight = labelDivHeight + (1 + 5) * 2;
  const labelDiv = document.createElement("div");
  labelDiv.style.position = "absolute";
  labelDiv.style.top = `${-((labelDivFullHeight - dotSide) / 2)}px`;
  labelDiv.style.left = `${dotSide + 5}px`;
  labelDiv.style.zIndex = 10;
  labelDiv.style.height = `${labelDivHeight}px`;
  labelDiv.style.width = "max-content";
  labelDiv.style.padding = "5px";
  labelDiv.style.border = "1px solid black";
  // labelDiv.style.borderRadius = "5px";
  labelDiv.style.background = "white";

  labelDiv.appendChild(labelContent);

  dotDiv.appendChild(labelDiv);
  return dotDiv;
}

function sortLangEvents(langDataset) {
  const sortedEvents = [];
  let langIndexCounter = 0;
  for (const langData of langDataset) {
    const langIndex = langIndexCounter++;
    for (const langEvent of langData.events) {
      const langEventExt = {
        version: langEvent.version,
        date: langEvent.date,
        language: langData.language,
        langIndex,
      };
      sortedEvents.push(langEventExt);
    }

    const langInitEventExt = {
      init: true,
      date: langData.init.date,
      language: langData.language,
      langIndex,
    };
    sortedEvents.push(langInitEventExt);
  }

  sortedEvents.sort((a, b) => {
    let c = +new Date(b.date) - +new Date(a.date);
    if (c !== 0) return c;
    return b.langIndex - a.langIndex;
  });

  return sortedEvents;
}

async function fetchLangDataset(languages) {
  const langDataList = [];
  for (const langKey of languages) {
    const langData = await fetch(`./data/${langKey}.json`).then((it) => it.json());
    langDataList.push(langData);
  }
  return langDataList;
}
