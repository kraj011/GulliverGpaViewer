import $ from "jquery";

/**
 * This method starts the process by getting the grades
 * from the page and starting to parse them
 */
const getGrades = () => {
  localStorage.setItem("sessionExpired", "false");
  var gradesList = $(".component-class-list-student");
  getCourses(gradesList[0]);
  // insaneMode = () => ;
};

/**
 * This method will create a json object with the list
 * of grades and their corresponding classes
 * @param gradesList the unparsed html list of grades
 */
const getCourses = gradesList => {
  var grades = [];
  for (var i = 0; i < $(gradesList).find(".course").length; i++) {
    let course = $(gradesList).find(".course")[i];
    if ($(course).find(".letter-grade").length > 0) {
      // console.log($(course).find(".course-name")[0].innerHTML + "   " + $(course).find(".numeric-grade")[0].innerHTML)
      grades.push({
        class: $(course).find(".course-name")[0].innerHTML,
        grade: $(course)
          .find(".letter-grade")[0]
          .innerHTML.replace(" ", "")
      });
    }
  }
  calculateGpa(grades);
};

/**
 * This method is for use from the background task to calculate gpa with its
 * own grades object pulled from local storage
 * @param grades a grades object instance that has class names with their grades
 */
const calculateGpaFromBackground = grades => {
  // ap  / IB = two points honors = 1 points boost

  let total = 0.0;
  let wtotal = 0.0;
  let classes = grades.length;
  let totalClassesLength = grades.length;
  for (let i = 0; i < classes; i++) {
    grades[i]["grade"]
      ? (grades[i]["grade"] = grades[i]["grade"].replace(" ", ""))
      : grades[i]["grade"];
    var gpaConst = getGpaConst(grades[i]);
    let wGpaConst = getWeightedGpaConstFromBackground(grades[i]);
    if (gpaConst !== null && wGpaConst !== null) {
      total += gpaConst;
      wtotal += wGpaConst;
    } else {
      totalClassesLength--;
    }
  }
  const oldGpa = total / totalClassesLength;
  const newGpa = Math.round(100 * oldGpa) / 100;
  const oldWGpa = wtotal / totalClassesLength;
  const newWGpa = Math.round(100 * oldWGpa) / 100;
  if (Number.isNaN(newGpa) || Number.isNaN(newWGpa)) {
    return;
  }
  return { weighted: newWGpa, unweighted: newGpa };
};

/**
 * This method handles the math for calculating the unweighted and weighted gpa
 * @param grades a grades object instance that has class names with their grades
 */
const calculateGpa = grades => {
  // ap  / IB = two points honors = 1 points boost
  let total = 0.0;
  let wtotal = 0.0;
  let classes = grades.length;
  let totalClassesLength = grades.length;
  for (let i = 0; i < classes; i++) {
    var gpaConst = getGpaConst(grades[i]);
    let wGpaConst = getWeightedGpaConst(grades[i]);
    if (gpaConst !== null && wGpaConst !== null) {
      total += gpaConst;
      wtotal += wGpaConst;
    } else {
      totalClassesLength--;
    }
  }
  const oldGpa = total / totalClassesLength;
  const newGpa = Math.round(100 * oldGpa) / 100;
  const oldWGpa = wtotal / totalClassesLength;
  const newWGpa = Math.round(100 * oldWGpa) / 100;
  if (Number.isNaN(newGpa) || Number.isNaN(newWGpa)) {
    setTimeout(getGrades, 500);
    return;
  }
  let newCourse = document.createElement("div");
  newCourse.className = "course";
  const html = `<div class="ae-grid"><div class="ae-grid__item item-sm-8"><div class="course-description"><a class="course-name" target="_blank" style="color: green;">Your Current Unweighted GPA: ${newGpa}</a> </div>  </div> </div>`;
  newCourse.innerHTML = html;
  document
    .getElementsByClassName("component-class-list-student")[0]
    .appendChild(newCourse);

  let newCourse2 = document.createElement("div");
  newCourse2.className = "course";
  const html2 = `<div class="ae-grid"><div class="ae-grid__item item-sm-8"><div class="course-description"><a class="course-name" target="_blank" style="color: green;">Your Current Weighted GPA: ${newWGpa}</a> </div>  </div> </div>`;
  newCourse2.innerHTML = html2;
  document
    .getElementsByClassName("component-class-list-student")[0]
    .appendChild(newCourse2);

  let newCourse3 = document.createElement("div");
  newCourse3.className = "course";
  const html3 = `<div class="ae-grid"><div class="ae-grid__item item-sm-8"><div class="course-description"><a class="course-name" target="_blank" style="color: green;"><input type="checkbox" id="insaneCheck" onclick="insaneMode = () => ">Parent Over Shoulder Mode</input></a> </div>  </div> </div>`;
  newCourse3.innerHTML = html3;
  // document
  //   .getElementsByClassName("component-class-list-student")[0]
  //   .appendChild(newCourse3);
};

/**
 * This method will return the GPA constant associated with the letter grade
 * @param grades a grades object instance that has class names with their grades
 */
const getGpaConst = grade => {
  switch (grade.grade) {
    case "A+":
      return 4.3;

    case "A":
      return 4.0;

    case "A-":
      return 3.7;

    case "B+":
      return 3.3;

    case "B":
      return 3.0;

    case "B-":
      return 2.7;

    case "C+":
      return 2.3;

    case "C":
      return 2.0;

    case "C-":
      return 1.7;

    case "D+":
      return 1.3;

    case "D":
      return 1.0;

    case "D-":
    case "F+":
    case "F":
    case "F-":
      return 0.0;
    default:
      return null;
  }
};
/**
 * This method will return the GPA constant associated with the letter grade plus
 * its corresponding weight with the type of class it is
 * @param grades a grades object instance that has class names with their grades from the background task
 */
const getWeightedGpaConstFromBackground = grade => {
  const boost = getClassWeight(grade.name);
  switch (grade.grade) {
    case "A+":
      return boost + 4.3;

    case "A":
      return boost + 4.0;

    case "A-":
      return boost + 3.7;

    case "B+":
      return boost + 3.3;

    case "B":
      return boost + 3.0;

    case "B-":
      return boost + 2.7;

    case "C+":
      return boost + 2.3;

    case "C":
      return boost + 2.0;

    case "C-":
      return boost + 1.7;

    case "D+":
      return boost + 1.3;

    case "D":
      return boost + 1.0;

    case "D-":
    case "F+":
    case "F":
    case "F-":
      return boost + 0.0;

    default:
      return null;
  }
};
/**
 * This method will return the GPA constant associated with the letter grade plus
 * its corresponding weight with the type of class it is
 * @param grades a grades object instance that has class names with their grades
 */
const getWeightedGpaConst = grade => {
  const boost = getClassWeight(grade.class);

  switch (grade.grade) {
    case "A+":
      return boost + 4.3;

    case "A":
      return boost + 4.0;

    case "A-":
      return boost + 3.7;

    case "B+":
      return boost + 3.3;

    case "B":
      return boost + 3.0;

    case "B-":
      return boost + 2.7;

    case "C+":
      return boost + 2.3;

    case "C":
      return boost + 2.0;

    case "C-":
      return boost + 1.7;

    case "D+":
      return boost + 1.3;

    case "D":
      return boost + 1.0;

    case "D-":
    case "F+":
    case "F":
    case "F-":
      return boost + 0.0;

    default:
      return null;
  }
};
/**
 * This will return a weight value based on the level of the class
 * For example, AP / IB classes get a 2 point weight, Honors get a 1 point weight, etc.
 * @param className the name of the class to get the weight for
 */
const getClassWeight = className => {
  if (
    className.includes("Pre IB") ||
    className.includes("Pre AP") ||
    className.includes(" AP") ||
    className.includes(" IB") ||
    className.includes("IB ") ||
    className.includes("AP ") ||
    className.includes("NEWL")
  ) {
    return 2;
  } else if (
    className.includes(" H") ||
    className.includes(" Honors") ||
    className.includes("Honors")
  ) {
    return 1;
  } else {
    return 0;
  }
};

/**
 * This function is on hold for now because its kinda stupid but pretty much
 * changes all the grades on the page to an A+ and a one hundred percent
 */
const insaneMode = () => {
  let script =
    'const insaneMode = () =>  { if(!document.getElementById("insaneCheck").checked) { location.reload = () => ; return; }var gradesList = $(".component-class-list-student");for (var i = 0; i < $(gradesList).find(".course").length; i++) {let course = $(gradesList).find(".course")[i];if ($(course).find(".letter-grade").length > 0) {$(course).find(".letter-grade")[0].innerHTML = "A+";$(course).find(".numeric-grade")[0].innerHTML = "100.00%";}}}';
  let scriptElem = document.createElement("script");
  scriptElem.innerHTML = script;
  document.head.appendChild(scriptElem);
};

$(document).ready(() => {
  console.log(window.location.href);
  if (window.location.href.includes("login")) {
    localStorage.setItem("sessionExpired", "true");
  } else {
    getGrades();
  }
});

export { calculateGpaFromBackground };
