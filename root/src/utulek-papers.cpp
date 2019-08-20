/*
Emilia-tan Script

Fetches Markdown for papers Utulek Labs.
*/

#include "rain-aeternum/rain-libraries.h"

int main(int argc, char *argv[]) {
  _setmode(_fileno(stdout), _O_BINARY);

  const std::string PAPERS_PATH = "C:\\main\\active\\erlija\\research\\utulek\\papers.md";
  std::string papers;
  Rain::readFileToStr(Rain::pathToAbsolute(PAPERS_PATH), papers);

  std::cout << R""""(HTTP/1.1 200 OK
content-type:text/html

<html>

<head>
  <title>GILGAMESH: utulek-papers</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />

  <link rel="stylesheet" href="/css/common.css" />
  <link rel="stylesheet" href="/css/index.css" />
  <link rel="stylesheet" href="/css/planet.css" />
  <link rel="stylesheet" href="/css/markdown.css" />
  <link rel="stylesheet" href="/css/script.css" />

  <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon" />

  <link href="https://fonts.googleapis.com/css?family=Montserrat&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap" rel="stylesheet">
</head>

<body class="script">
  <pre><code>)""""
  << papers << R""""(</code></pre>
</body>

</html>
)"""";

  return 0;
}