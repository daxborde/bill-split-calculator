let subtotalElement = document.querySelector("#subtotal-input");
let totalElement = document.querySelector("#total-input");
let resultsElement = document.querySelector("#results");
subtotalElement.onkeyup = updateResults;
totalElement.onkeyup = updateResults;
updateResults();
// let defaultResultsText = resultsElement.textContent;

function updateResults() {
  let billText = subtotalElement.value.replaceAll(/[<>]/g, "").trim();
  let subtotalParsed = parseTextBlock(billText);

  let totTipText = totalElement.value
    .split("\n")
    .slice(0, 2)
    .map((str) => str.trim());
  let preTipTotal = parseFloat(totTipText[0]);
  let tipPercent = parseFloat(totTipText[1]);

  let splitSubtotal = {};
  let subtotal = 0;
  if (billText) {
    subtotalParsed.forEach((currentLine) => {
      let itemCost = parseFloat(currentLine[0]);
      subtotal += itemCost;
      let nameList = currentLine.slice(1);

      let numPeople = nameList.length;
      let costPerPerson = itemCost / numPeople;
      nameList.forEach((personName) => {
        if (!Object.hasOwn(splitSubtotal, personName)) {
          splitSubtotal[personName] = costPerPerson;
        } else {
          splitSubtotal[personName] += costPerPerson;
        }
      });
    });
  }

  if (!Number.isFinite(preTipTotal)) {
    preTipTotal = subtotal;
  }

  let finalTotal;
  let tipAmount = 0;

  if (Number.isFinite(tipPercent)) {
    tipAmount = (tipPercent / 100.0) * subtotal;
    finalTotal = preTipTotal + tipAmount;
    console.log("tipAmount:" + tipAmount);
    console.log("finalTotal:" + finalTotal);
  } else {
    finalTotal = preTipTotal;
  }

  let splitTotal = {};

  for (const [person, currSplitSubtotal] of Object.entries(splitSubtotal)) {
    // splitTotal/finalTotal = currSplitSubtotal/Subtotal
    splitTotal[person] = finalTotal * (currSplitSubtotal / subtotal);
  }

  let resultsString =
    "<p>Total + Tip: " +
    finalTotal.toFixed(2) +
    "</p>" +
    twoColTable(Object.entries(splitTotal), "Person", "Total + Tip") +
    "<br />" +
    "<p>Subtotal: " +
    subtotal.toFixed(2) +
    "</p>" +
    "<p>Total - Subtotal (Tax): " +
    (preTipTotal - subtotal).toFixed(2) +
    "</p>" +
    "<p>Tip: " +
    tipAmount.toFixed(2) +
    "</p>" +
    twoColTable(Object.entries(splitSubtotal), "Person", "Subtotal") +
    "<br />" +
    "";

  resultsElement.innerHTML = resultsString;

  // else simply do not render, leave existing text.
}

function twoColTable(entries, heading1, heading2) {
  return (
    '<table><thead><tr><th scope="col">' +
    heading1 +
    '</th><th scope="col">' +
    heading2 +
    "</th></tr></thead><tbody>" +
    entries
      .map(([person, currSplitTotal]) => {
        return (
          "<tr><td>" +
          person +
          "</td><td>" +
          currSplitTotal.toFixed(2) +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table>"
  );
}

function parseTextBlock(textBlock) {
  let allLines = textBlock.split("\n");
  let parsed = allLines.map((line) => line.split(" "));
  return parsed;
}
// Format:
// 34.20 talia dax person1
// 2.4 person1 3<
// 1 3< dax