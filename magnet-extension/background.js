function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

browser.menus.create({
  id: "add-magnet",
  title: "Add Torrent",
  contexts: ["link"]
}, onCreated);

function MakeXhrRequest(magnetContent, serverip){

  var xhr = new XMLHttpRequest();

  var URL = 'http://'+serverip + '/api/';

  if(magnetContent.slice(0,6) === 'magnet')
    URL += 'magnet';
  else
    URL += 'url';

  xhr.open("POST", URL, true);

  //Include browser based Cookie header and Authorization header(if set)
  xhr.withCredentials = true;

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-type", "text/plain");

  xhr.onreadystatechange = function() {
  if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
  // Request finished. Do processing here. Maybe send notification to the user via browser
    console.log("XHR SUCCESS");
    }
  }
  xhr.send(magnetContent);
}

function sendMagnet(magnet){
  browser.storage.sync.get("server").then( result => {
    MakeXhrRequest(magnet, result.server.ip);
  }, error => {
    console.log(`Error: ${error}`);
  });
}

browser.menus.onClicked.addListener((info, tab) => {
  // console.log("Item " + info.menuItemId + " clicked " +
  //             "in tab " + tab.id);
  // console.log(info.linkUrl);
  sendMagnet(info.linkUrl);
});

// http://ctorrent.torrent/addtorrent/* handler
function handleTorrentUrl(requestDetails) {
  const magnetUri = decodeURIComponent(requestDetails.url.slice("http://ctorrent.torrent/addtorrent/".length,));
  // console.log("Loading: " + magnetUri);
  sendMagnet(magnetUri);
  return {cancel: true}
}

browser.webRequest.onBeforeRequest.addListener(
  handleTorrentUrl,
  {urls: ["http://ctorrent.torrent/addtorrent/*"]},
  ['blocking']
);
