

fetch("./data/_ref.json")
    .then(response => response.json())
    .then(main);

Object.prototype.myLet = function(f) { f(this); };

async function main(rootLangRef) {
    const langDataset = await fetchLangDataset(rootLangRef.languages);
    const sortedLangEvents = sortLangEvents(langDataset);

    const rootElem = document.getElementById("root");
    rootElem.appendChild(document.createElement("hr"));
    const timelineRootElem = document.createElement("div");
    timelineRootElem.style.position = "relative";

    const orderedRootElem = document.createElement("div");
    for (const langEvent of sortedLangEvents) {
        document.createElement("p").myLet(it => {
            if (langEvent.init) {
                it.innerHTML = `<b>${langEvent.language} (${langEvent.date})</b>`;
            } else {
                it.innerText = `${langEvent.language} ${langEvent.version} (${langEvent.date})`;
            }
            orderedRootElem.appendChild(it);
        });
    }
    timelineRootElem.appendChild(orderedRootElem);
    rootElem.appendChild(timelineRootElem);
    rootElem.appendChild(document.createElement("hr"));
}

function sortLangEvents(langDataset) {
    const sortedEvents = [];
    let langIndexCounter = 0;
    for (const langData of langDataset) {
        const langIndex = langIndexCounter++;
        for (const langEvent of langData.events) {
            const langEventExt = {...langEvent, language: langData.language, langIndex};
            sortedEvents.push(langEventExt);
        }

        const langInitEventExt = {
            init: true,
            date: langData.init.date,
            language: langData.language,
            langIndex
        };
        sortedEvents.push(langInitEventExt);
    }

    sortedEvents.sort((a, b) => {
        let c = (+new Date(b.date)) - (+new Date(a.date));
        if (c !== 0) return c;
        return b.langIndex - a.langIndex;
    });

    return sortedEvents;
}

async function fetchLangDataset(languages) {
    const langDataList = [];
    for (const langKey of languages) {
        const langData = await fetch(`./data/${langKey}.json`).then(it => it.json());
        langDataList.push(langData);
    }
    return langDataList;
}