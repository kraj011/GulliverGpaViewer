import $ from "jquery";

function getCookies(domain, name, callback) {
  chrome.cookies.get(
    {
      url: domain,
      name: name
    },
    function(cookie) {
      if (callback) {
        callback(cookie.value);
      }
    }
  );
}
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     // usage:
//     getCookies("https://portals.veracross.com/", "_veracross_session", function (id) {
//         alert(id);
//     });
// })

function pullGrades() {
  getCookies("https://portals.veracross.com/", "_veracross_session", function(
    id
  ) {
    // send get req with this cookie to pull grades
    // TODO: ADD CHECK TO MAKE SURE ID IS A THING LOL
    if (id) {
      $.get({
        url:
          "https://portals.veracross.com/gulliver/student/component/ClassListStudent/1308/load_data",
        headers: {
          _veracross_session: id
        },
        success: function(result) {
          if (typeof result != typeof JSON) {
            return;
          }
          let classes = [];
          // so we got the right response
          for (let i = 0; i < result["courses"].length; i++) {
            classes.push({
              name: result["courses"][i]["description"],
              grade: result["courses"][i]["ptd_grade"]
            });
          }
          var ba = chrome.browserAction;
          ba.setBadgeBackgroundColor({ color: [255, 0, 0, 128] });
          ba.setBadgeText({ text: "" + 4 });
          console.log(classes);
          if (localStorage.getItem("currentGrades") !== null) {
            let storedGrades = localStorage.getItem("currentGrades");
            if (storedGrades !== JSON.stringify(classes)) {
              console.log(storedGrades);
              console.log("GRADES UPDATED!");
            }
          }
          localStorage.setItem("currentGrades", JSON.stringify(classes));
        },
        failure: function(error) {}
      });
    }
  });
}

pullGrades();

chrome.alarms.create("pullGrades", {
  delayInMinutes: 5,
  periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "pullGrades") {
    pullGrades();
  }
});
