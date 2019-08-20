/*
Emilia-tan Script

This script prints the environment variables.
*/

#include "rain-aeternum/rain-libraries.h"

int main(int argc, char *argv[]) {
  _setmode(_fileno(stdout), _O_BINARY);

  std::string getQueryParameters;
  std::map<std::string, std::string> query = Rain::getQueryToMap(std::getenv("QUERY_STRING"));
  for (auto it = query.begin(); it != query.end(); it++) {
    getQueryParameters += it->first + ": " + it->second + Rain::CRLF;
  }

  std::string environmentVariables;
  LPTCH curEnvBlock = GetEnvironmentStrings();
  int prevVarBeg = -1;
  for (int a = 0;; a++) {
    if (curEnvBlock[a] == '\0') {
      std::string s = std::string(curEnvBlock + prevVarBeg + 1, curEnvBlock + a);
      environmentVariables += s + Rain::CRLF;
      prevVarBeg = a;
      if (curEnvBlock[a + 1] == '\0')
        break;
    }
  }
  FreeEnvironmentStrings(curEnvBlock);

  static const int BUFFER_SIZE = 65536;
  char *buffer = new char[BUFFER_SIZE];
  std::string postQuery;
  while (std::cin) {
    std::cin.read(buffer, BUFFER_SIZE);
    postQuery += std::string(buffer, static_cast<std::size_t>(std::cin.gcount()));
  };
  delete[] buffer;

  std::cout << R""""(HTTP/1.1 200 OK
content-type:text/html

<html>

<head>
  <title>GILGAMESH: print-properties</title>
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
  <h1>Query & Server Properties</h1>
  <h2>Client IP</h2>
  <pre><code>)""""
            << std::getenv("CLIENT_IP") << R""""(</code></pre>
  <h2>Emilia Server Version</h2>
  <pre><code>)""""
            << std::getenv("EMILIA_VERSION") << R""""(</code></pre>
  <h2>Emilia-tan Last Modified Time</h2>
  <pre><code>)""""
            << Rain::getTime("%F %T%z", Rain::getFileLastModifyTime("../../.emilia/index.idx")) << R""""(</code></pre>
  <h2>GET Query Parameters</h2>
  <pre><code>)""""
            << getQueryParameters << R""""(</code></pre>
  <h2>Environment Variables</h2>
  <pre><code>)""""
            << environmentVariables << R""""(</code></pre>
  <h2>POST Query</h2>
  <pre><code>)""""
            << postQuery << R""""(</code></pre>
</body>

</html>
)"""";

  return 0;
}
