function saveOptions(e) {
  e.preventDefault();
  var server = {
    ip: document.querySelector("#serverip").value,
    // port: document.querySelector("#serverport").value
  }
  browser.storage.sync.set({server: server});
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#serverip").value = result.server.ip || "localhost:3000";
    // document.querySelector("#serverport").value = result.server.port || "3000";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.sync.get("server");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
