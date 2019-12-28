function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

browser.menus.create({
  id: "add-magnet",
  title: "Add torrent",
  contexts: ["all"]
}, onCreated);

function sendMagnet(magnetContent, serverip){
  // Send download request to the background for the format selected
  var xhr = new XMLHttpRequest();

  xhr.open("POST", 'http://'+serverip+'/api/magnet', true);

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = function() {
  //Call a function when the state changes.
  if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
  // Request finished. Do processing here.
    console.log("XHR SUCCESS");
    }
  }
  xhr.send(magnetContent);
}

browser.menus.onClicked.addListener((info, tab) => {
  console.log("Item " + info.menuItemId + " clicked " +
              "in tab " + tab.id);
  console.log(info.linkUrl);

  function setCurrentChoice(result) {
    sendMagnet(info.linkUrl, result.server.ip);
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  browser.storage.sync.get("server").then(setCurrentChoice, onError);
  // sendMagnet(info.linkUrl);

});
