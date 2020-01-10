function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("(Add Torrent) Context-Menu created successfully");
  }
}

browser.menus.create({
  id: "add-magnet",
  title: "Add Torrent",
  contexts: ["link"]
}, onCreated);

function PushNotification(title, message){
  browser.notifications.create("Cloud-Torrent-Magnet", {
  "type": "basic",
  "iconUrl": browser.runtime.getURL("icons/page-48.png"),
  "title": title,
  "message": message
  });
}

function GetTorrentName(magnetContent){
  if(magnetContent.slice(0,6) !== 'magnet')
    return magnetContent;
  const _url = new URL(magnetContent);
  return _url.searchParams.get("dn");
}

function MakeXhrRequest(magnetContent, url){

  var xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);

  //Include browser based Cookie header and Authorization header(if set)
  xhr.withCredentials = true;

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-type", "text/plain");

  torrentName = GetTorrentName(magnetContent);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE){
      if(xhr.status == 200)
        PushNotification("Torrent Added", torrentName);
      // else
      //   PushNotification("Failed!!!", torrentName);
    }
  }
  
  xhr.send(magnetContent);
}

function sendMagnet(magnet){
  browser.storage.sync.get("server").then( result => {
      var url = 'http://'+result.server.ip + '/api/';
      if(magnet.slice(0,6) === 'magnet')
        url += 'magnet';
      else
        url += 'url';
    MakeXhrRequest(magnet, url);
  }, error => {
    console.log(`Error: ${error}`);
  });
}

browser.menus.onClicked.addListener((info, tab) => {
  sendMagnet(info.linkUrl);
});

// http://ctorrent.torrent/addtorrent/* handler
function handleTorrentUrl(requestDetails) {
  const magnetUri = decodeURIComponent(requestDetails.url.slice("http://ctorrent.torrent/addtorrent/".length,));
  sendMagnet(magnetUri);
  return {cancel: true}
}

browser.webRequest.onBeforeRequest.addListener(
  handleTorrentUrl,
  {urls: ["http://ctorrent.torrent/addtorrent/*"]},
  ['blocking']
);
