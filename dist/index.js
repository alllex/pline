

fetch("./data/_ref.json")
    .then(response => response.json())
    .then(main);

async function main(rootLangRef) {
    const langDataset = await fetchLangDataset(rootLangRef.languages);

    const rootElem = document.getElementById("root");
    const timelineRootElem = document.createElement("div");
    timelineRootElem.style.position = "relative";

    let leftOffset = 0;
    for (const langData of langDataset) {
        const langDivElem = document.createElement("div");
        langDivElem.style.position = "relative";
        langDivElem.style.left = `${leftOffset}px`;

        for (const langEvent of langData.events) {
            const langEventElem = document.createElement("p");
            langEventElem.innerText = `${langData.language} ${langEvent.version} (${langEvent.date})`;
            langDivElem.appendChild(langEventElem);
        }

        const langInitEventElem = document.createElement("p");
        langInitEventElem.innerHTML = `<b>${langData.language} (${langData.init.date})</b>`;
        langDivElem.appendChild(langInitEventElem);

        timelineRootElem.appendChild(langDivElem);

        leftOffset += 30;
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