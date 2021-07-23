

fetch("./data/_ref.json")
    .then(response => response.json())
    .then(main);

async function main(rootLangRef) {
    const langDataset = await fetchLangDataset(rootLangRef.languages);

    const rootElem = document.getElementById("root");
    const timelineRootElem = document.createElement("div");

    for (const langData of langDataset) {
        for (const langEvent of langData.events) {
            const langEventElem = document.createElement("p");
            langEventElem.innerText = `${langData.language} ${langEvent.version} (${langEvent.date})`;
            timelineRootElem.appendChild(langEventElem);
        }

        const langInitEventElem = document.createElement("p");
        langInitEventElem.innerHTML = `<b>${langData.language} (${langData.init.date})</b>`;
        timelineRootElem.appendChild(langInitEventElem);
    }

    rootElem.appendChild(timelineRootElem);
}

async function fetchLangDataset(languages) {
    const langDataList = [];
    for (const langKey of languages) {
        const langData = await fetch(`./data/${langKey}.json`).then(it => it.json());
        langDataList.push(langData);
    }
    return langDataList;
}