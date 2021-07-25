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
  const timelinePlaneElem = document.createElement("div").myAlso((it) => {
    it.style.position = "relative";
    it.style.width = "700px";
    it.style.height = "1000px"; // TODO: compute from event count
    it.style.background = "aliceblue";
  });

  const timelineSlotHeight = 50;
  const prevEventByLang = new Map();

  let timelineSlotTop = 0;
  for (langEvent of sortedLangEvents) {
    timelineSlotTop += timelineSlotHeight;

    const eventLabel = document.createElement("div").myAlso((it) => {
      it.style.background = "#fafafa";
      if (langEvent.init) {
        it.innerHTML = `<b>${langEvent.language} (${langEvent.date})</b>`;
      } else {
        it.innerText = `${langEvent.language} ${langEvent.version} (${langEvent.date})`;
      }
    });

    const labeledDot = renderLabeledDot(timelineSlotTop, 50, eventLabel);
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
    const langData = await fetch(`./data/${langKey}.json`).then((it) =>
      it.json()
    );
    langDataList.push(langData);
  }
  return langDataList;
}
