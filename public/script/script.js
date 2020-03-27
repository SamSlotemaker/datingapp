//progressive form code from https://www.w3schools.com/howto/howto_js_form_steps.asp


//maak alle tabs standaard niet zichtbaar
var tabs = document.querySelectorAll(".choice .tab");
console.log(tabs);
for(let i = 0; i < tabs.length; i++){
  tabs[i].style.display = 'none';
}

var nextButton = document.querySelector('button');
nextButton.type = 'button';
var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "flex";
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");

  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("carForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}
