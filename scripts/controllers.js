function ButtonPlay() {
    window.ChangeButtonPlay(!window.play);
    window.PlayTimeline();
}


function ButtonReset() {
    window.ChangeButtonPlay(false);
    window.year = window.startYear;
    window.UpdateData();
}


function ChangeButtonPlay(state) {
    window.play = state;
    if(window.play) document.getElementsByName("ButtonPlay")[0].innerHTML = "<span class=\"glyphicon glyphicon-pause\"></span>";
    else document.getElementsByName("ButtonPlay")[0].innerHTML = "<span class=\"glyphicon glyphicon-play\"></span>";
}

function ButtonBackward() {
    window.ChangeButtonPlay(false);
    if(window.year > window.startYear) window.year--;
    window.UpdateData();
}

function ButtonForward() {
    window.ChangeButtonPlay(false);
    if(window.year < window.endYear) window.year++;
    window.UpdateData();
}

function ButtonStepBackward() {
    window.ChangeButtonPlay(false);
    if(window.year > window.startYear) {
        window.year = _.find(historyData.slice().reverse(), (data) => { return data.year < window.year }).year;
    }
    window.UpdateData();
}

function ButtonStepForward() {
    window.ChangeButtonPlay(false);
    if(window.year < window.endYear) {
        window.year = _.find(historyData, (data) => { return data.year > window.year }).year;
    }
    window.UpdateData();
}

function KeyPress(e) {
    e = e || window.event;
    if(e.keyCode == '33' || e.keyCode == '37') {
        // left arrow
        window.ButtonBackward();
    }
    else if (e.keyCode == '34' || e.keyCode == '39') {
        // right arrow
        window.ButtonForward();
    }
    else if (e.keyCode == '190') {
        // dot
        window.SwitchDescriptionType();
    }
}

function ButtonDescription() {
    window.playWithDescPause = !window.playWithDescPause;
    if(window.playWithDescPause) document.getElementsByName("DescButton")[0].innerHTML = "Não pausar a cada evento";
    else document.getElementsByName("DescButton")[0].innerHTML = "Pausar a cada evento";
}


function SwitchDescriptionType() {
    window.wikipedia = !window.wikipedia;
    if(window.wikipedia) document.getElementsByName("SwitchDescButton")[0].innerHTML = "Mudar para a narrativa";
    else document.getElementsByName("SwitchDescButton")[0].innerHTML = "Mudar para a Wikipedia";
    var updateYear = Number(_.max(window.historyData, (historyDataYear) => { return historyDataYear.year <= window.year ? historyDataYear.year : 0 }).year);
    window.ChangeDescription(updateYear);
}

function ChangeDescription(year) {
    var historyDataYear = _.find(window.historyData, (historyDataYear) => { return historyDataYear.year == year });
    if(historyDataYear) {
        document.getElementById("title-event").innerHTML = '<span class="glyphicon glyphicon-book"></span>  ' + historyDataYear.name;
        document.getElementById("description-image").src = historyDataYear.img;
        if(window.wikipedia) ChangeWikipediaDescription(historyDataYear.wiki, historyDataYear.section);
        else window.ChangeStoryDescription(historyDataYear);
        if(window.playWithDescPause) window.ChangeButtonPlay(false);
    }
}

function ChangeWikipediaDescription(page, section) {
    $('#description').wikiblurb({
      wikiURL: "https://pt.wikipedia.org/",
      apiPath: 'w',
      section: section,
      page: page,
      removeLinks: false,	    
      type: 'text',
      customSelector: '',
      callback: function(){ }
    });
}
  
function ChangeStoryDescription(historyDataYear) {
    var storytellingDataYear = _.find(window.storytellingData, (storytellingDataYear) => { return storytellingDataYear.year == historyDataYear.year });
    document.getElementById("description").innerHTML = storytellingDataYear.text;
}