import $ from "jquery";

/**
 * This function is used to get cookies stored in chrome
 * @param domain  the domain name that the cookie is stored under
 * @param name    the name of the cookie
 * @param callback  the callback function to run once this function finishes executing
 */
const getCookies = (domain, name, callback) => {
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
};

/**
 * This function pulls the grades and handles the response accordingly
 */
const pullGrades = () => {
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
          console.log(`[${getTime()}]`, classes);
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
              // here send the notification saying grade has been updated!
              sendNotification();
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
};

/**
 * This function uses the built in chrome API to send a local notification
 * to the user when their grades are updated
 */
const sendNotification = () => {
  let notifOptions = {
    type: "basic",
    iconUrl: "../icons/icon48.png",
    title: "Grades updated!",
    message:
      "You're grades have been updated! Open the extension or veracross portal to check!"
  };
  chrome.notifications.create("gradeUpdatedNotif", notifOptions);
};

/**
 * Simple method for getting a formatted time string
 */
const getTime = () => {
  var d = new Date();
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};

/**
 * This function is what begins the whole life cycle of the extension
 * and will start doing all background execution ever 3 minutes
 */
const start = () => {
  pullGrades();

  chrome.alarms.create("pullGrades", {
    delayInMinutes: 3,
    periodInMinutes: 3
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "pullGrades") {
      pullGrades();
    }
  });
};

start();
