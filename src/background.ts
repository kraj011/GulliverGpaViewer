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
          let letterClasses = [];
          // so we got the right response
          for (let i = 0; i < result["courses"].length; i++) {
            classes.push({
              name: result["courses"][i]["description"],
              grade: result["courses"][i]["ptd_grade"]
            });
          }
          for (let i = 0; i < result["courses"].length; i++) {
            letterClasses.push({
              name: result["courses"][i]["description"],
              grade: result["courses"][i]["ptd_letter_grade"]
            });
          }
          let gradeDifCounter = 0;
          var ba = chrome.browserAction;
          ba.setBadgeBackgroundColor({ color: [255, 0, 0, 128] });
          console.log(classes);
          if (localStorage.getItem("currentGrades") !== null) {
            let storedGrades = localStorage.getItem("currentGrades");
            if (storedGrades !== JSON.stringify(classes)) {
              console.log(storedGrades);
              for (let i = 0; i < classes.length; i++) {
                if (classes[i]["grade"] !== storedGrades[i]["grade"]) {
                  gradeDifCounter++;
                }
              }
              ba.setBadgeText({ text: "" + gradeDifCounter });
            }
          }
          localStorage.setItem("currentGrades", JSON.stringify(classes));
          localStorage.setItem("letterGrades", JSON.stringify(letterClasses));
        },
        failure: function(error) {
          console.log("failed");
        }
      });
    } else {
      console.log("non existent cookie?");
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
