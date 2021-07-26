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
  const timelineContainerDiv = document.createElement("div");
  timelineContainerDiv.classList.add("center");
  rootElem.appendChild(timelineContainerDiv);
  renderTimeline(timelineContainerDiv, sortedLangEvents);
}

function renderTimeline(domParent, sortedLangEvents) {
  const docWidth = document.documentElement.clientWidth || document.body.clientWidth
  const timelinePlaneWidth = docWidth * 0.8;
  const timelinePlaneElem = document.createElement("div").myAlso((it) => {
    it.style.position = "relative";
    it.style.width = `${timelinePlaneWidth}px`;
    // it.style.background = "aliceblue";
  });
  domParent.appendChild(timelinePlaneElem);

  const timelineSlotHeight = 70;
  const langSlots = [];
  const prevLangSlots = new Map();

  let timelineSlotTop = 0;
  for (const langEvent of sortedLangEvents) {
    timelineSlotTop += timelineSlotHeight;
    timelinePlaneElem.style.height = `${timelineSlotTop + timelineSlotHeight}px`;

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

    const langSlotWidthStep = timelinePlaneWidth / (langSlots.length + 1);

    for (let curLangSlotIndex = 0; curLangSlotIndex < langSlots.length; curLangSlotIndex++) {
      const curLangSlot = langSlots[curLangSlotIndex];
      const curLangIndex = curLangSlot.langIndex;
      const curLangSlotTop = timelineSlotTop;
      const curLangSlotLeft = langSlotWidthStep * (curLangSlotIndex + 1);

      const dotDiv = document.createElement("div");
      dotDiv.style.position = "absolute";
      dotDiv.style.top = `${curLangSlotTop}px`;
      dotDiv.style.left = `${curLangSlotLeft}px`;
      dotDiv.style.height = `${10}px`;
      dotDiv.style.width = `${10}px`;
      dotDiv.style.border = "2px solid darkgrey";
      dotDiv.style.background = "darkgrey";
      dotDiv.setAttribute("lang", curLangSlot.language);
      timelinePlaneElem.appendChild(dotDiv);

      const prevLangSlot = prevLangSlots.get(curLangIndex);
      if (prevLangSlot === undefined) continue;
      const prevLangSlotIndex = prevLangSlot.slotIndex;

      const prevLangSlotTop = prevLangSlot.top;
      const prevLangSlotLeft = prevLangSlot.left;

      const midLeft = (prevLangSlotLeft + curLangSlotLeft) / 2;
      const midTop = (prevLangSlotTop + curLangSlotTop) / 2;
      const midHeight = (curLangSlotTop - prevLangSlotTop) / 2;
      const midWidth = Math.abs(prevLangSlotLeft - curLangSlotLeft) / 2;

      const lineBorderWidth = 14;
      const lineBorderRadius = lineBorderWidth;
      const lineZIndex = 0;
      const lineColor = "lightskyblue";

      const createLineDiv = () => {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = lineZIndex;
        div.style.width = `${midWidth}px`;
        div.style.height = `${midHeight}px`;
        div.style.borderStyle = "solid";
        div.style.borderWidth = 0;
        div.style.borderColor = lineColor;
        return div;
      };

      if (
        curLangSlotIndex < prevLangSlotIndex ||
        (curLangSlotIndex === prevLangSlotIndex && prevLangSlots.size < langSlots.length)
      ) {
        const topLineDiv = createLineDiv();
        topLineDiv.style.top = `${prevLangSlotTop}px`;
        topLineDiv.style.left = `${midLeft}px`;
        topLineDiv.style.borderRightWidth = `${lineBorderWidth}px`;
        topLineDiv.style.borderBottomWidth = `${lineBorderWidth}px`;
        topLineDiv.style.borderBottomRightRadius = `${lineBorderRadius}px`;
        timelinePlaneElem.appendChild(topLineDiv);

        const bottomLineDiv = createLineDiv();
        bottomLineDiv.style.top = `${midTop}px`;
        bottomLineDiv.style.left = `${curLangSlotLeft}px`;
        bottomLineDiv.style.borderTopWidth = `${lineBorderWidth}px`;
        bottomLineDiv.style.borderLeftWidth = `${lineBorderWidth}px`;
        bottomLineDiv.style.borderTopLeftRadius = `${lineBorderRadius}px`;
        timelinePlaneElem.appendChild(bottomLineDiv);
      } else if (prevLangSlotIndex < curLangSlotIndex) {
        const topLineDiv = createLineDiv();
        topLineDiv.style.top = `${prevLangSlotTop}px`;
        topLineDiv.style.left = `${prevLangSlotLeft}px`;
        topLineDiv.style.borderLeftWidth = `${lineBorderWidth}px`;
        topLineDiv.style.borderBottomWidth = `${lineBorderWidth}px`;
        topLineDiv.style.borderBottomLeftRadius = `${lineBorderRadius}px`;
        timelinePlaneElem.appendChild(topLineDiv);

        const bottomLineDiv = createLineDiv();;
        bottomLineDiv.style.top = `${midTop}px`;
        bottomLineDiv.style.left = `${midLeft}px`;
        bottomLineDiv.style.borderTopWidth = `${lineBorderWidth}px`;
        bottomLineDiv.style.borderRightWidth = `${lineBorderWidth}px`;
        bottomLineDiv.style.borderTopRightRadius = `${lineBorderRadius}px`;
        timelinePlaneElem.appendChild(bottomLineDiv);
      } else {
        const vertLineDiv = createLineDiv();
        vertLineDiv.style.top = `${prevLangSlotTop}px`;
        vertLineDiv.style.left = `${prevLangSlotLeft}px`;
        vertLineDiv.style.height = `${midHeight * 2}px`;
        vertLineDiv.style.borderLeftWidth = `${lineBorderWidth}px`;
        timelinePlaneElem.appendChild(vertLineDiv);
      }
    }

    const langEventTop = timelineSlotTop;
    const langEventLeft = langSlotWidthStep * (langSlotIndex + 1);

    prevLangSlots.clear();
    for (let i = 0; i < langSlots.length; i++) {
      prevLangSlots.set(langSlots[i].langIndex, {
        slotIndex: i,
        top: timelineSlotTop,
        left: langSlotWidthStep * (i + 1),
      });
    }

    if (langEvent.init) {
      langSlots.splice(langSlotIndex, 1);
    }

    const eventLabel = document.createElement("div").myAlso((it) => {
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
  dotDiv.style.zIndex = 5;
  dotDiv.style.top = `${top}px`;
  dotDiv.style.left = `${left}px`;
  dotDiv.style.margin = "0";
  dotDiv.style.height = `${dotSide}px`;
  dotDiv.style.width = `${dotSide}px`;
  dotDiv.style.background = "seashell";
  dotDiv.style.border = "2px solid lightskyblue";

  const labelDivHeight = 30;
  const labelDivFullHeight = labelDivHeight + (1 + 5) * 2;
  const labelDiv = document.createElement("div");
  labelDiv.classList.add("center");
  labelDiv.style.position = "absolute";
  labelDiv.style.top = `${-((labelDivFullHeight - dotSide) / 2)}px`;
  labelDiv.style.left = `${dotSide + 5}px`;
  labelDiv.style.zIndex = 10;
  labelDiv.style.height = `${labelDivHeight}px`;
  labelDiv.style.width = "max-content";
  labelDiv.style.padding = "5px 10px";
  labelDiv.style.border = "1px solid #cccccc";
  labelDiv.style.borderRadius = "5px";
  labelDiv.style.background = "#ffffffdd";

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
