function cleanProductInfo($, element, unwantedPhrases) {
    $(element)
      .find("input, select, option, form, button, svg, path")
      .remove();

  const rawText = $(element).text().split("\n");

  const cleanLines = rawText
      .map(line => line.trim())
      .filter(
              line =>
                        line.length > 0 &&
                        !unwantedPhrases.some(bad =>
                                    line.toLowerCase().includes(bad.toLowerCase())
                                                      )
            );

  return cleanLines.join("\n");
}

module.exports = cleanProductInfo;
