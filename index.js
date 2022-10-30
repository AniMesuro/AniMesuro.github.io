let trnsPacks = {
	'pt-br': null,
}
// adds 'is-pinned' class to sticky navbar.
const navBar = document.querySelector(".navbar");
const navBarObserver = new IntersectionObserver(
	function([e]) {
		return e.target.classList.toggle("is-pinned", e.intersectionRatio < 1);
	}, {threshold: [1]}
);
navBarObserver.observe(navBar);

let isTranslated = false;
const navBtnLang = document.getElementById("nav-btn-lang");
navBtnLang.onclick = function(){
	if (isTranslated){
		return;
	}
	translateWebsite("pt-br");
	configData.locale.lang = "pt-br"; 
	isTranslated = true;
}
const commissionBtnConvert = document.getElementById("commission-btn-convert");
commissionBtnConvert.onclick = function(){
	if (configData.commission.currency == "u") {
		configData.commission.currency = "b";
		commissionBtnConvert.textContent = "Convert to USD";
	}
	else if (configData.commission.currency == "b"){
		configData.commission.currency = "u";
		commissionBtnConvert.textContent = "Convert to BRL";
	}
	fillCommissionTable();
}


function getFileFromServer(url, doneCallback){
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = handleStateChange;
	xhr.open("GET", url, true);
	xhr.send();
	function handleStateChange(){
		if (xhr.readyState == 4) {
			doneCallback(xhr.responseText);
		}
	}
}

let configData = {};
let configText = "";

getFileFromServer("site-config.txt", function(text){
	if (text == null) {
		console.log("site-config.txt couldn't read.")
		return
	}
	else{
		configText = text;
		manageConfig();
	}
})
function manageConfig(){
	// reads each line as a variable
	let configLines = configText.split("\n");
	let currentSectionId = -1, currentSectionName = "";
	for (i=0; i<configLines.length; i++){
		configLines[i] = configLines[i].trim();
		const lineTokens = configLines[i].split(" ");
		if (lineTokens.length == 0){
			continue
		}
		if (lineTokens[0] != "--" && (lineTokens.length < 3 || currentSectionName == "")){
			continue;
		}
		switch (lineTokens[0]){
			case "--": // section start/end
				currentSectionId += 1;
				currentSectionName = configLines[i].substring(3);
				if (currentSectionName == ""){continue;}
				configData[currentSectionName] = {};
				break
			case "b": // bool
				let booledValue = false;
				if (lineTokens[2] == '1' || lineTokens[2] == 'true'){
					booledValue = true;
				}
				configData[currentSectionName][lineTokens[1]] = booledValue;
				break;
			case "a": // array
				configData[currentSectionName][lineTokens[1]] = lineTokens[2].split(",");
				break;
			default: // other
				configData[currentSectionName][lineTokens[1]] = String(lineTokens[2]);
				break;
		}
	}
	// rework site based on config.
	if (configData.commission.is_open){
		fillCommissionTable();
	} else {
		document.getElementById("nav-commission-a").style.color = "#ccc";
		document.getElementById("commission-content").textContent = "Commissions are currently closed.";
	}

	translateWebsite(configData.locale.lang);
}

function fillCommissionTable(){
	const trList = (document.getElementById("commission-table-body").getElementsByTagName("tr"));
	const tdListSketch = trList[0].getElementsByTagName("td");
	const tdListLineart = trList[1].getElementsByTagName("td");
	const tdListFlatColors = trList[2].getElementsByTagName("td");
	const tdListFullDrawing = trList[3].getElementsByTagName("td");
	const tdListFullPainting = trList[4].getElementsByTagName("td");

	if (configData.commission.currency == "u"){ //usd
		for (i=0; i<3; i++){
			tdListSketch[i].textContent = "$ "+ configData.commission.pr_usd_sketch[i];
			tdListLineart[i].textContent = "$ "+ configData.commission.pr_usd_lineart[i];
			tdListFlatColors[i].textContent = "$ "+ configData.commission.pr_usd_flat_colors[i];
			tdListFullDrawing[i].textContent = "$ "+ configData.commission.pr_usd_full_drawing[i];
			tdListFullPainting[i].textContent = "$ "+ configData.commission.pr_usd_full_painting[i];
		}
	}
	else if (configData.commission.currency == "b"){ //brl
		for (i=0; i<3; i++){
			tdListSketch[i].textContent = "R$ "+ configData.commission.pr_brl_sketch[i];
			tdListLineart[i].textContent = "R$ "+ configData.commission.pr_brl_lineart[i];
			tdListFlatColors[i].textContent = "R$ "+ configData.commission.pr_brl_flat_colors[i];
			tdListFullDrawing[i].textContent = "R$ "+ configData.commission.pr_brl_full_drawing[i];
			tdListFullPainting[i].textContent = "R$ "+ configData.commission.pr_brl_full_painting[i];
		}
	}
}

// Translates website based on server files.
function translateWebsite(lang){
	if (! (lang in trnsPacks)){
		return;
	}
	if (trnsPacks[lang] == null){
		import("/locale/"+lang+".js") .then((langModule) =>{
			trnsPacks[lang] = langModule;
			translateFromModule(trnsPacks[lang]);
		});
	}else{
		translateFromModule(trnsPacks[lang]);
	}
}
function translateFromModule(trModule){
	const textTranslationKeys = Object.keys(trModule.textTranslation);
	const htmlTranslationKeys = Object.keys(trModule.htmlTranslation);
	for (i=0; i<textTranslationKeys.length; i++){
		const id = textTranslationKeys[i];
		if (id == '' || document.getElementById(id) == undefined){
			continue;
		}
		document.getElementById(id).textContent = trModule.textTranslation[id];
	}
	for (i=0; i<htmlTranslationKeys.length; i++){
		const id = htmlTranslationKeys[i];
		if (id == '' || document.getElementById(id) == undefined){
			continue;
		}
		document.getElementById(id).innerHTML = trModule.htmlTranslation[id];
	}
}