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

function MakeXhrRequest(magnetContent, url){

  var xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);

  //Include browser based Cookie header and Authorization header(if set)
  // xhr.withCredentials = true;
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa('test' + ':' + 'test123'));

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

// function MakeXhrRequest(magnetContent, url){
//     var clientId = "test";
//     var clientSecret = "test123";
//     var authorizationBasic = window.btoa(clientId + ':' + clientSecret);
//
//     var request = new XMLHttpRequest();
//     request.open('POST', url, true);
//     request.setRequestHeader("Content-type", "text/plain");
//     request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);
//
//     request.send(magnetContent);
//
//     request.onreadystatechange = function () {
//         if (request.readyState === 4) {
//            console.log(request.responseText);
//        }else{
//            console.log("readystate", request.readyState);
//        }
//     };
// }

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
